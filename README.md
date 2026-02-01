# My Website

Vite 프론트엔드 + FastAPI 백엔드 프로젝트입니다.

## 프로젝트 구조

```
├── frontend/       # Vite + HTML/CSS/JS
│   ├── index.html
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── backend/        # FastAPI
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
└── docker-compose.yml
```

## 시작하기

### Frontend (Vite)

```bash
cd frontend
npm install
npm run dev
```

- http://localhost:3000 에서 확인
- `/api` 요청은 자동으로 백엔드(8000)로 프록시됨

### Backend (FastAPI)

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

- API: http://localhost:8000
- API 문서: http://localhost:8000/docs

### 동시 실행

1. 터미널 1: `cd backend && uvicorn main:app --reload`
2. 터미널 2: `cd frontend && npm run dev`

### Docker

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API 문서: http://localhost:8000/docs
