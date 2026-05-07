import fs from 'fs'
import path from 'path'
import { logsDir } from './paths.js'

function logPath(id: string): string {
  return path.join(logsDir, `${id}.log`)
}

export function appendLog(id: string, line: string): void {
  fs.appendFileSync(logPath(id), line.replace(/\n/g, ' ') + '\n', 'utf-8')
}

export function readLogs(id: string, maxLines: number = 400): string[] {
  const p = logPath(id)
  if (!fs.existsSync(p)) return []
  const raw = fs.readFileSync(p, 'utf-8')
  const lines = raw.split('\n').filter(Boolean)
  if (lines.length <= maxLines) return lines
  return lines.slice(lines.length - maxLines)
}

