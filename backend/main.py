from datetime import datetime
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="메이플 TODO API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== 인메모리 저장소 ==========
store = {
    "goal_amount": 0,
    "current_amount": 0,
    "records": [],       # 이번달 수입/지출 기록
    "contents": [],      # 메포 컨텐츠 (딸깍 지출용)
    "bosses": [],        # 보스 체크 목록
}
_next_id = {"records": 1, "contents": 1, "bosses": 1}


# ========== Pydantic 모델 ==========

class GoalBalanceUpdate(BaseModel):
    goal_amount: Optional[int] = Field(None, ge=0)
    current_amount: Optional[int] = Field(None, ge=0)


class RecordCreate(BaseModel):
    type: str = Field(..., pattern="^(income|expense)$")
    amount: int = Field(..., ge=0)
    description: str = ""
    date: Optional[str] = None  # YYYY-MM-DD, 없으면 오늘


class ContentCreate(BaseModel):
    name: str
    cost: int = Field(..., ge=0)
    category: Optional[str] = None


class ContentSpend(BaseModel):
    """메포 컨텐츠 딸깍 시 1회 지출 기록"""
    content_id: int


class AhMaeProfitCreate(BaseModel):
    """아매획 수익 자동 기록"""
    amount: int = Field(..., ge=0)
    description: str = ""


class BossCreate(BaseModel):
    name: str
    reward_amount: int = Field(0, ge=0)


class BossCheck(BaseModel):
    boss_id: int
    reward_amount: Optional[int] = None  # 실제 수입, 없으면 기본 보상으로 기록


# ========== 1. 목표 금액 / 보유 금액 비율 ==========

@app.get("/api/goal-balance")
def get_goal_balance():
    """목표 금액, 보유 금액, 달성 비율(%) 반환"""
    goal = store["goal_amount"]
    current = store["current_amount"]
    ratio = round((current / goal * 100), 1) if goal > 0 else 0
    return {
        "goal_amount": goal,
        "current_amount": current,
        "ratio_percent": ratio,
    }


@app.put("/api/goal-balance")
def update_goal_balance(body: GoalBalanceUpdate):
    """목표 금액 또는 보유 금액 수정"""
    if body.goal_amount is not None:
        store["goal_amount"] = body.goal_amount
    if body.current_amount is not None:
        store["current_amount"] = body.current_amount
    return get_goal_balance()


# ========== 2. 이번달 수입/지출 기록 ==========

def _this_month(d: datetime) -> str:
    return d.strftime("%Y-%m")


@app.get("/api/records")
def list_records(month: Optional[str] = None):
    """수입/지출 기록 목록. month 없으면 이번달 (YYYY-MM)"""
    target = month or _this_month(datetime.now())
    filtered = [r for r in store["records"] if (r.get("date") or "")[:7] == target]
    return {"records": sorted(filtered, key=lambda x: (x["date"], x["id"]), reverse=True)}


@app.post("/api/records")
def create_record(body: RecordCreate):
    """수입 또는 지출 기록 추가"""
    rid = _next_id["records"]
    _next_id["records"] += 1
    date = body.date or datetime.now().strftime("%Y-%m-%d")
    record = {
        "id": rid,
        "type": body.type,
        "amount": body.amount,
        "description": body.description,
        "date": date,
        "created_at": datetime.now().isoformat(),
    }
    store["records"].append(record)
    if body.type == "income":
        store["current_amount"] += body.amount
    else:
        store["current_amount"] -= body.amount
    return record


@app.delete("/api/records/{record_id}")
def delete_record(record_id: int):
    """기록 삭제 (보유 금액 반영 제거)"""
    for i, r in enumerate(store["records"]):
        if r["id"] == record_id:
            rec = store["records"].pop(i)
            if rec["type"] == "income":
                store["current_amount"] -= rec["amount"]
            else:
                store["current_amount"] += rec["amount"]
            return {"deleted": record_id}
    raise HTTPException(status_code=404, detail="Record not found")


# ========== 3. 메포 컨텐츠 딸깍 지출 ==========

@app.get("/api/contents")
def list_contents():
    """메포(메이플 컨텐츠) 목록"""
    return {"contents": store["contents"]}


@app.post("/api/contents")
def create_content(body: ContentCreate):
    """메포 컨텐츠 추가"""
    cid = _next_id["contents"]
    _next_id["contents"] += 1
    content = {
        "id": cid,
        "name": body.name,
        "cost": body.cost,
        "category": body.category,
    }
    store["contents"].append(content)
    return content


@app.post("/api/contents/spend")
def spend_content(body: ContentSpend):
    """컨텐츠 딸깍 시 해당 비용으로 지출 1회 기록 + 보유 금액 차감"""
    for c in store["contents"]:
        if c["id"] == body.content_id:
            store["current_amount"] -= c["cost"]
            rid = _next_id["records"]
            _next_id["records"] += 1
            date = datetime.now().strftime("%Y-%m-%d")
            record = {
                "id": rid,
                "type": "expense",
                "amount": c["cost"],
                "description": f"[메포] {c['name']}",
                "date": date,
                "created_at": datetime.now().isoformat(),
                "content_id": c["id"],
            }
            store["records"].append(record)
            return {"record": record, "content": c}
    raise HTTPException(status_code=404, detail="Content not found")


@app.delete("/api/contents/{content_id}")
def delete_content(content_id: int):
    for i, c in enumerate(store["contents"]):
        if c["id"] == content_id:
            store["contents"].pop(i)
            return {"deleted": content_id}
    raise HTTPException(status_code=404, detail="Content not found")


# ========== 4. 아매획 수익 자동 기록 ==========

@app.post("/api/ahmae")
def record_ahmae_profit(body: AhMaeProfitCreate):
    """아매획(아이템 매매) 수익 자동 기록 → 수입 추가 + 보유 금액 증가"""
    rid = _next_id["records"]
    _next_id["records"] += 1
    date = datetime.now().strftime("%Y-%m-%d")
    record = {
        "id": rid,
        "type": "income",
        "amount": body.amount,
        "description": body.description or "[아매획] 수익",
        "date": date,
        "created_at": datetime.now().isoformat(),
        "source": "ahmae",
    }
    store["records"].append(record)
    store["current_amount"] += body.amount
    return record


# ========== 5. 보스 체크 수입 확인 ==========

@app.get("/api/bosses")
def list_bosses():
    """보스 목록 (체크 여부 포함)"""
    return {"bosses": store["bosses"]}


@app.post("/api/bosses")
def create_boss(body: BossCreate):
    """보스 추가"""
    bid = _next_id["bosses"]
    _next_id["bosses"] += 1
    boss = {
        "id": bid,
        "name": body.name,
        "reward_amount": body.reward_amount,
        "checked": False,
        "checked_at": None,
    }
    store["bosses"].append(boss)
    return boss


@app.post("/api/bosses/check")
def check_boss(body: BossCheck):
    """보스 체크 → 수입 기록 + 보스 체크 완료 처리"""
    for b in store["bosses"]:
        if b["id"] == body.boss_id:
            if b["checked"]:
                raise HTTPException(status_code=400, detail="Already checked")
            amount = body.reward_amount if body.reward_amount is not None else b["reward_amount"]
            b["checked"] = True
            b["checked_at"] = datetime.now().isoformat()
            # 수입 기록
            rid = _next_id["records"]
            _next_id["records"] += 1
            date = datetime.now().strftime("%Y-%m-%d")
            record = {
                "id": rid,
                "type": "income",
                "amount": amount,
                "description": f"[보스] {b['name']}",
                "date": date,
                "created_at": datetime.now().isoformat(),
                "boss_id": b["id"],
            }
            store["records"].append(record)
            store["current_amount"] += amount
            return {"boss": b, "record": record}
    raise HTTPException(status_code=404, detail="Boss not found")


@app.post("/api/bosses/reset")
def reset_bosses():
    """보스 체크 초기화 (주간 리셋 등)"""
    for b in store["bosses"]:
        b["checked"] = False
        b["checked_at"] = None
    return {"bosses": store["bosses"]}


@app.delete("/api/bosses/{boss_id}")
def delete_boss(boss_id: int):
    for i, b in enumerate(store["bosses"]):
        if b["id"] == boss_id:
            store["bosses"].pop(i)
            return {"deleted": boss_id}
    raise HTTPException(status_code=404, detail="Boss not found")


# ========== 기존 헬스 ==========

@app.get("/")
def root():
    return {"message": "메이플 TODO API가 정상 동작 중입니다."}


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
