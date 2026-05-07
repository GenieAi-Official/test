import { Router, type Request, type Response } from 'express'
import { ensureDirs } from '../services/paths.js'
import { openLogin } from '../services/executor.js'
import { checkLoginStatus } from '../services/loginStatus.js'

const router = Router()

router.post('/open', async (req: Request, res: Response): Promise<void> => {
  ensureDirs()
  if (process.env.XHS_ALLOW_HEADED_LOGIN !== '1') {
    res.status(400).json({
      success: false,
      error: '当前环境未启用可视化登录。请在带 GUI 的主机设置 XHS_ALLOW_HEADED_LOGIN=1，或在本地登录后把会话目录同步到服务器。',
    })
    return
  }
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
