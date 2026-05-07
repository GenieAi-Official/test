import path from 'path'
import fs from 'fs'
import type { TaskDetail } from '../../shared/types.js'
import { outDir } from './paths.js'
import { appendLog, readLogs } from './taskLog.js'
import { runTask } from './executor.js'
import { getTask, saveTask } from './taskStore.js'

type QueueItem = { id: string }

class TaskQueue {
  private running = false
  private queue: QueueItem[] = []

  enqueue(id: string): void {
    this.queue.push({ id })
    this.kick()
  }

  private kick(): void {
    if (this.running) return
    void this.loop()
  }

  private async loop(): Promise<void> {
    this.running = true
    try {
      while (this.queue.length > 0) {
        const item = this.queue.shift()
        if (!item) continue
        const task = getTask(item.id)
        if (!task) continue
        if (task.status !== 'queued') continue

        task.status = 'running'
        task.startedAt = new Date().toISOString()
        saveTask(task)
        appendLog(task.id, 'running')

        const result = await runTask(task, task.params)
        const now = new Date().toISOString()
        task.finishedAt = now
        if (result.ok) {
          task.status = 'succeeded'
          appendLog(task.id, 'succeeded')
          task.indexMdPath = path.join(outDir, task.id, 'index.md')
          task.artifacts = listArtifacts(path.join(outDir, task.id))
        } else {
          task.status = 'failed'
          task.error = result.error || 'failed'
          appendLog(task.id, `failed: ${task.error}`)
          task.artifacts = listArtifacts(path.join(outDir, task.id))
        }
        task.logs = readLogs(task.id, 400)
        saveTask(task)
      }
    } finally {
      this.running = false
    }
  }
}

function listArtifacts(dir: string): Array<{ name: string; path: string; size: number }> {
  if (!fs.existsSync(dir)) return []
  const files: Array<{ name: string; path: string; size: number }> = []
  const walk = (base: string) => {
    const entries = fs.readdirSync(base, { withFileTypes: true })
    for (const e of entries) {
      const p = path.join(base, e.name)
      if (e.isDirectory()) walk(p)
      else {
        const st = fs.statSync(p)
        files.push({ name: path.relative(dir, p), path: p, size: st.size })
      }
    }
  }
  walk(dir)
  files.sort((a, b) => (a.name > b.name ? 1 : -1))
  return files
}

export const taskQueue = new TaskQueue()
