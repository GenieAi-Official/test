import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import type { CreateTaskRequest, TaskDetail, TaskType } from '../../shared/types.js'
import { outDir, repoRoot, userDataDir } from './paths.js'
import { appendLog } from './taskLog.js'

function typeToCmd(type: TaskType): string {
  if (type === 'search') return 'search'
  if (type === 'user') return 'user'
  return 'note'
}

function buildArgs(task: TaskDetail, req: CreateTaskRequest): string[] {
  const cmd = typeToCmd(task.type)
  const args: string[] = ['-m', 'xhs_scraper', cmd]

  if (task.type === 'search') {
    args.push(req.keyword || '')
    args.push('--limit', String(req.limit ?? 30))
  } else if (task.type === 'user') {
    args.push(req.url || '')
    args.push('--limit', String(req.limit ?? 30))
  } else {
    args.push(req.url || '')
  }

  const taskOut = path.join(outDir, task.id)
  fs.mkdirSync(taskOut, { recursive: true })
  args.push('--out', taskOut)
  args.push('--user-data-dir', userDataDir)
  if (req.downloadMedia) args.push('--download-media')
  return args
}

export async function runTask(task: TaskDetail, req: CreateTaskRequest): Promise<{ ok: boolean; error?: string }> {
  appendLog(task.id, `spawn python task=${task.id} type=${task.type}`)
  const args = buildArgs(task, req)
  appendLog(task.id, `python ${args.join(' ')}`)

  const env = {
    ...process.env,
    PYTHONPATH: repoRoot,
  }

  return await new Promise((resolve) => {
    const child = spawn('python', args, {
      cwd: repoRoot,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    child.stdout.on('data', (buf) => appendLog(task.id, String(buf).trim()))
    child.stderr.on('data', (buf) => appendLog(task.id, String(buf).trim()))

    child.on('error', (err) => {
      appendLog(task.id, `error: ${err.message}`)
      resolve({ ok: false, error: err.message })
    })

    child.on('close', (code) => {
      if (code === 0) resolve({ ok: true })
      else resolve({ ok: false, error: `exit ${code}` })
    })
  })
}

export async function openLogin(waitSeconds: number = 600): Promise<{ ok: boolean; error?: string }> {
  const args = ['-m', 'xhs_scraper', 'login', '--user-data-dir', userDataDir, '--wait-seconds', String(waitSeconds)]
  const env = { ...process.env, PYTHONPATH: repoRoot }
  return await new Promise((resolve) => {
    const child = spawn('python', args, { cwd: repoRoot, env, stdio: ['ignore', 'pipe', 'pipe'] })
    child.on('error', (err) => resolve({ ok: false, error: err.message }))
    child.on('close', (code) => {
      if (code === 0) resolve({ ok: true })
      else resolve({ ok: false, error: `exit ${code}` })
    })
  })
}

