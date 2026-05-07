import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

export async function buildZip(srcDir: string, zipPath: string): Promise<boolean> {
  const base = path.dirname(zipPath)
  fs.mkdirSync(base, { recursive: true })

  const code = [
    'import shutil, sys, os',
    `src = r"""${srcDir}"""`,
    `out = r"""${zipPath}"""`,
    'base = os.path.splitext(out)[0]',
    'if os.path.exists(out): os.remove(out)',
    'shutil.make_archive(base, "zip", src)',
    'print("ok")',
  ].join('\\n')

  return await new Promise((resolve) => {
    const child = spawn('python', ['-c', code], { stdio: ['ignore', 'pipe', 'pipe'] })
    child.on('error', () => resolve(false))
    child.on('close', (code) => resolve(code === 0 && fs.existsSync(zipPath)))
  })
}

