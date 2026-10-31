import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { createInterpretHandler } from './server/aiProxy.js'

const aiProxy = (env: Record<string, string | undefined>): Plugin => ({
  name: 'tracewise-ai-proxy',
  configureServer(server) { server.middlewares.use('/api/ai/interpret', async (req, res) => { if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }; const text = await new Promise<string>((resolve, reject) => { let value = ''; req.on('data', (chunk) => { value += String(chunk) }); req.on('end', () => resolve(value)); req.on('error', reject) }); let body: unknown; try { body = JSON.parse(text) } catch { body = null }; const result = await createInterpretHandler({ env })(body); res.statusCode = result.status; res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(result.json)) }) },
  configurePreviewServer(server) { server.middlewares.use('/api/ai/interpret', async (req, res) => { if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }; const text = await new Promise<string>((resolve, reject) => { let value = ''; req.on('data', (chunk) => { value += String(chunk) }); req.on('end', () => resolve(value)); req.on('error', reject) }); let body: unknown; try { body = JSON.parse(text) } catch { body = null }; const result = await createInterpretHandler({ env })(body); res.statusCode = result.status; res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(result.json)) }) },
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
  plugins: [react(), aiProxy(env)],
  }
})
