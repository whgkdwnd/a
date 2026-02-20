# 메이플 TODO

목표 메소와 수입·지출을 관리하는 **데스크톱 앱**입니다. 데이터는 로컬 엑셀 파일로 저장되며, 인터넷·DB 연결이 필요 없습니다.

## 프로젝트 구조

```
├── frontend/       # Vite + HTML/CSS/JS (UI)
├── electron/       # 데스크톱 앱: main.js, preload.js (엑셀 읽기/쓰기)
└── package.json    # Electron + .exe 빌드 (루트)
```

## 실행 방법

```bash
# 루트에서
npm install
npm run dev
```

- **Vite 개발 서버**와 **Electron**이 동시에 실행됩니다.
- **핫 리로드**: HTML/CSS/JS를 수정하면 Electron 창에 바로 반영됩니다. (저장 시 자동 새로고침)
- 데이터 파일 위치: `%APPDATA%\메이플 TODO\data.xlsx` (Windows)

## .exe 설치 파일 만들기

```bash
npm run build
```

- 결과물: `release/` 폴더에 **메이플 TODO Setup 1.0.0.exe** 생성
- 설치 후 실행하면 엑셀 파일로 자동 저장/로드됩니다.

## 개발 시 참고

- **`npm run dev`**(루트): Vite 서버 + Electron 동시 실행 → **핫 리로드**로 UI 수정 결과를 바로 확인할 수 있습니다.
- Electron 창에서 개발자 도구(DevTools)가 자동으로 열리며, 콘솔/네트워크 확인이 가능합니다.


