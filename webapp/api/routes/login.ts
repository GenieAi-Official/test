import { Router, type Request, type Response } from 'express'
import { ensureDirs } from '../services/paths.js'
import { openLogin } from '../services/executor.js'
import { checkLoginStatus } from '../services/loginStatus.js'

const router = Router()

router.post('/open', async (req: Request, res: Response): Promise<void> => {
  ensureDirs()
  const waitSeconds = Number(req.body?.waitSeconds ?? 600)
  const result = await openLogin(Number.isFinite(waitSeconds) ? waitSeconds : 600)
  if (!result.ok) {
    res.status(500).json({ success: false, error: result.error || 'open failed' })
    return
  }
  res.status(200).json({ success: true })
})

router.get('/status', async (_req: Request, res: Response): Promise<void> => {
  ensureDirs()
  const status = await checkLoginStatus()
  res.status(200).json({ success: true, data: status })
})

export default router

