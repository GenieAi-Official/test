import fs from 'fs'
import path from 'path'
import { tasksDir } from './paths.js'
import type { TaskDetail, TaskSummary } from '../../shared/types.js'

function taskPath(id: string): string {
  return path.join(tasksDir, `${id}.json`)
}

export function listTasks(): TaskSummary[] {
  const files = fs.existsSync(tasksDir) ? fs.readdirSync(tasksDir) : []
  const tasks: TaskSummary[] = []
  for (const f of files) {
    if (!f.endsWith('.json')) continue
    try {
      const raw = fs.readFileSync(path.join(tasksDir, f), 'utf-8')
      const t = JSON.parse(raw) as TaskSummary
      if (t?.id) tasks.push(t)
    } catch {
    }
  }
  tasks.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  return tasks
}

export function getTask(id: string): TaskDetail | null {
  const p = taskPath(id)
  if (!fs.existsSync(p)) return null
  try {
    const raw = fs.readFileSync(p, 'utf-8')
    return JSON.parse(raw) as TaskDetail
  } catch {
    return null
  }
}

export function saveTask(task: TaskDetail): void {
  fs.writeFileSync(taskPath(task.id), JSON.stringify(task, null, 2), 'utf-8')
}

