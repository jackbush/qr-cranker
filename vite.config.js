import { defineConfig } from 'vite'

export default defineConfig({
  base: '/qr-cranker/',
  test: {
    environment: 'jsdom',
  },
})
