import { Link } from 'react-router-dom'
import { ShieldCheck, Sparkles } from 'lucide-react'
import type { LoginStatusResponse } from '../shared/types'

function badge(status: LoginStatusResponse | null): { text: string; tone: string } {
  if (!status) return { text: '登录状态：未知', tone: 'bg-zinc-900/5 text-zinc-800 border-zinc-900/10' }
  if (status.status === 'logged_in') return { text: '登录状态：已登录', tone: 'bg-emerald-500/15 text-emerald-900 border-emerald-600/20' }
  if (status.status === 'not_logged_in') return { text: '登录状态：未登录', tone: 'bg-red-500/15 text-red-900 border-red-600/20' }
  return { text: '登录状态：未知', tone: 'bg-amber-500/15 text-amber-900 border-amber-600/20' }
}

export function HeaderBar(props: { login: LoginStatusResponse | null }) {
  const b = badge(props.login)
  return (
    <div className="sticky top-0 z-10 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg))]/70 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-[0_8px_30px_rgba(0,0,0,0.10)]">
            <Sparkles className="h-5 w-5 text-[rgb(var(--ring))]" />
          </div>
          <div>
            <Link to="/" className="font-[var(--serif)] text-lg tracking-tight">
              XHS Scraper Console
            </Link>
            <div className="text-xs text-[rgb(var(--muted))]">自托管 · 任务队列 · Markdown 归档</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${b.tone}`}>
            <ShieldCheck className="h-4 w-4" />
            {b.text}
          </span>
        </div>
      </div>
    </div>
  )
}

