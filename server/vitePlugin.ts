import type { Plugin } from 'vite'
import { createInterpretHandler } from './aiProxy.js'

export const aiProxy = (env: Record<string, string | undefined>): Plugin => {
  const useMiddleware = (server: any) => {
    server.middlewares.use('/api/ai/interpret', async (req: any, res: any) => {
      if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
      const text = await new Promise<string>((resolve, reject) => { let value = ''; req.on('data', (chunk: unknown) => { value += String(chunk) }); req.on('end', () => resolve(value)); req.on('error', reject) })
      let body: unknown; try { body = JSON.parse(text) } catch { body = null }
      const result = await createInterpretHandler({ env })(body)
      res.statusCode = result.status; res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(result.json))
    })
  }
  return { name: 'tracewise-ai-proxy', configureServer: useMiddleware, configurePreviewServer: useMiddleware }
}
