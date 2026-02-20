import { defineConfig } from 'vite'

export default defineConfig({
  base: './', // Electron file:// 로드 시 상대 경로 필요
  root: '.',
  publicDir: 'public',
  server: {
    port: 3000,
    host: true,
  }
})
