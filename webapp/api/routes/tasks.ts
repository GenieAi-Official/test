import { Router, type Request, type Response } from 'express'
import crypto from 'crypto'
import path from 'path'
import fs from 'fs'
import type { CreateTaskRequest, TaskDetail, TaskSummary } from '../../shared/types.js'
import { ensureDirs, outDir, tmpDir } from '../services/paths.js'
import { appendLog, readLogs } from '../services/taskLog.js'
import { getTask, listTasks, saveTask } from '../services/taskStore.js'
import { taskQueue } from '../services/queue.js'
import { buildZip } from '../services/zip.js'

const router = Router()

function isSafeId(id: string): boolean {
  return /^[a-f0-9-]{16,64}$/i.test(id)
}

function normalizeCreateReq(body: any): CreateTaskRequest {
  const type = body?.type
  const req: CreateTaskRequest = {
    type,
    keyword: typeof body?.keyword === 'string' ? body.keyword.trim() : undefined,
    url: typeof body?.url === 'string' ? body.url.trim() : undefined,
    limit: Number.isFinite(Number(body?.limit)) ? Number(body.limit) : undefined,
    downloadMedia: Boolean(body?.downloadMedia),
  }
  if (req.limit !== undefined) req.limit = Math.max(1, Math.min(200, req.limit))
  return req
}

router.post('/', async (req: Request, res: Response): Promise<void> => {
  ensureDirs()
  const payload = normalizeCreateReq(req.body)

  if (!['search', 'user', 'note'].includes(payload.type)) {
    res.status(400).json({ success: false, error: 'invalid type' })
    return
  }
  if (payload.type === 'search' && !payload.keyword) {
    res.status(400).json({ success: false, error: 'keyword required' })
    return
  }
  if (payload.type !== 'search' && !payload.url) {
    res.status(400).json({ success: false, error: 'url required' })
    return
  }

  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  const task: TaskDetail = {
    id,
    type: payload.type,
    status: 'queued',
    createdAt: now,
    params: payload,
    logs: [],
    artifacts: [],
  }
  saveTask(task)
  appendLog(id, 'queued')
  taskQueue.enqueue(id)
  res.status(200).json({ success: true, data: task })
})

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  ensureDirs()
  const tasks = listTasks()
  res.status(200).json({ success: true, data: tasks })
})

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  ensureDirs()
  const id = String(req.params.id || '')
  if (!isSafeId(id)) {
    res.status(400).json({ success: false, error: 'invalid id' })
    return
  }
  const task = getTask(id)
  if (!task) {
    res.status(404).json({ success: false, error: 'not found' })
    return
  }
  task.logs = readLogs(id, 400)
  saveTask(task)
  res.status(200).json({ success: true, data: task })
})

router.get('/:id/index.md', async (req: Request, res: Response): Promise<void> => {
  ensureDirs()
  const id = String(req.params.id || '')
  if (!isSafeId(id)) {
    res.status(400).json({ success: false, error: 'invalid id' })
    return
  }
  const p = path.join(outDir, id, 'index.md')
  if (!fs.existsSync(p)) {
    res.status(404).json({ success: false, error: 'not found' })
    return
  }
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
  res.status(200).send(fs.readFileSync(p, 'utf-8'))
})

router.get('/:id/download', async (req: Request, res: Response): Promise<void> => {
  ensureDirs()
  const id = String(req.params.id || '')
  if (!isSafeId(id)) {
    res.status(400).json({ success: false, error: 'invalid id' })
    return
  }
  const dir = path.join(outDir, id)
  if (!fs.existsSync(dir)) {
    res.status(404).json({ success: false, error: 'not found' })
    return
  }
  const zipPath = path.join(tmpDir, `${id}.zip`)
  const ok = await buildZip(dir, zipPath)
  if (!ok) {
    res.status(500).json({ success: false, error: 'zip failed' })
    return
  }
  res.download(zipPath, `xhs_${id}.zip`)
})

export default router

