import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { loadEnv } from 'vite'
import { aiProxy } from '../server/vitePlugin.js'

// https://vite.dev/config/
const repoRoot = fileURLToPath(new URL('..', import.meta.url))

export default defineConfig(({ mode }) => ({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react(), tailwindcss(), aiProxy(loadEnv(mode, repoRoot, ''))],
  resolve: {
    alias: {
      '@engine': fileURLToPath(new URL('../src/engine', import.meta.url)),
      '@server': fileURLToPath(new URL('../server', import.meta.url)),
    },
    dedupe: ['zod'],
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
  preview: { host: '0.0.0.0' },
}))
