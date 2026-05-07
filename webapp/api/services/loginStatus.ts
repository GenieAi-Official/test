import { spawn } from 'child_process'
import fs from 'fs'
import type { LoginStatusResponse } from '../../shared/types.js'
import { repoRoot, userDataDir } from './paths.js'

export async function checkLoginStatus(): Promise<LoginStatusResponse> {
  if (!fs.existsSync(userDataDir)) {
    return { status: 'not_logged_in', message: '未找到会话目录' }
  }

  try {
    const result = await runPythonCheck()
    if (result.ok === true) {
      if (result.loggedIn === true) return { status: 'logged_in', message: '已登录（校验成功）' }
      if (result.loggedIn === false) return { status: 'not_logged_in', message: '未登录（校验成功）' }
    }
    return { status: 'unknown', message: result.error || '无法确认登录状态' }
  } catch (e) {
    return { status: 'unknown', message: e instanceof Error ? e.message : '无法确认登录状态' }
  }
}

async function runPythonCheck(): Promise<{ ok: boolean; loggedIn?: boolean; error?: string }> {
  const env = { ...process.env, PYTHONPATH: repoRoot }
  const code = [
    'import asyncio, json',
    'from pathlib import Path',
    'from playwright.async_api import async_playwright',
    `user_data_dir = r"""${userDataDir}"""`,
    'async def main():',
    '  async with async_playwright() as p:',
    '    ctx = await p.chromium.launch_persistent_context(user_data_dir=user_data_dir, headless=True, viewport={"width": 1280, "height": 800})',
    '    page = await ctx.new_page()',
    '    try:',
    '      await page.goto("https://www.xiaohongshu.com", wait_until="domcontentloaded", timeout=60000)',
    '      await page.wait_for_timeout(1200)',
    '      has_login = await page.evaluate("""() => {',
    '        const t = document.body ? document.body.innerText || "" : "";',
    '        return t.includes("登录") || t.includes("注册");',
    '      }""")',
    '      await ctx.close()',
    '      print(json.dumps({"ok": True, "loggedIn": (not has_login)}, ensure_ascii=False))',
    '    except Exception as e:',
    '      try: await ctx.close()',
    '      except Exception: pass',
    '      print(json.dumps({"ok": False, "error": str(e)}, ensure_ascii=False))',
    'asyncio.run(main())',
  ].join('\\n')

  return await new Promise((resolve) => {
    const child = spawn('python', ['-c', code], { cwd: repoRoot, env, stdio: ['ignore', 'pipe', 'pipe'] })
    let out = ''
    let err = ''
    child.stdout.on('data', (b) => (out += String(b)))
    child.stderr.on('data', (b) => (err += String(b)))
    child.on('error', (e) => resolve({ ok: false, error: e.message }))
    child.on('close', () => {
      if (!out.trim()) resolve({ ok: false, error: err.trim() || 'no output' })
      try {
        resolve(JSON.parse(out.trim()))
      } catch {
        resolve({ ok: false, error: (err || out).trim().slice(0, 400) })
      }
    })
  })
}

