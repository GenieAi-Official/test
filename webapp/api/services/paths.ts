import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const webappRoot = path.resolve(__dirname, '..', '..')
export const repoRoot = path.resolve(webappRoot, '..')

export const dataDir = path.resolve(process.env.DATA_DIR || path.join(webappRoot, 'data'))
export const tasksDir = path.join(dataDir, 'tasks')
export const logsDir = path.join(dataDir, 'logs')
export const outDir = path.join(dataDir, 'out')
export const tmpDir = path.join(dataDir, 'tmp')
export const userDataDir = path.resolve(process.env.XHS_USER_DATA_DIR || path.join(dataDir, 'profile'))

export function ensureDirs(): void {
  for (const dir of [dataDir, tasksDir, logsDir, outDir, tmpDir, userDataDir]) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

