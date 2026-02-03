import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 3000,
    host: '0.0.0.0', // Docker 등에서 호스트가 접속하려면 필요
    open: !process.env.BACKEND_URL, // Docker 안에서는 브라우저 자동 열기 비활성화
    hmr: {
      // Docker: 브라우저(호스트)가 HMR WebSocket 연결할 포트
      clientPort: 3000,
      host: 'localhost'
    },
    watch: {
      // Docker: 호스트에서 변경한 파일을 컨테이너가 감지하려면 폴링 필요
      usePolling: true
    },
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
