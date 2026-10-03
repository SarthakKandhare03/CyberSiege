import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
// Base path is configurable via VITE_BASE_PATH env variable for GitHub Pages deployment
// Set VITE_BASE_PATH=/your-repo-name/ when deploying to GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
  test: {
    globals: true,
    environment: 'node',
  },
})
