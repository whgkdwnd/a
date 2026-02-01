from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="My API", version="1.0.0")

# CORS 설정 - 프론트엔드(포트 3000)에서 API 호출 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    """API 루트 엔드포인트"""
    return {"message": "API가 정상 동작 중입니다."}


@app.get("/api/health")
def health_check():
    """헬스 체크 엔드포인트"""
    return {"status": "ok"}
