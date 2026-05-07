import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Card } from './Card'
import { StatusPill } from './StatusPill'
import type { TaskSummary } from '../shared/types'

function title(t: TaskSummary): string {
  if (t.type === 'search') return '关键词搜索'
  if (t.type === 'user') return '用户主页'
  return '笔记链接'
}

export function TaskList(props: { tasks: TaskSummary[]; selectedId: string | null }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-[rgb(var(--border))] px-5 py-4">
        <div className="font-[var(--serif)] text-lg tracking-tight">任务</div>
        <div className="text-xs text-[rgb(var(--muted))]">{props.tasks.length} 条</div>
      </div>
      <div className="max-h-[520px] overflow-auto">
        {props.tasks.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-[rgb(var(--muted))]">还没有任务</div>
        ) : (
          <div className="divide-y divide-[rgb(var(--border))]">
            {props.tasks.map((t) => {
              const active = props.selectedId === t.id
              return (
                <Link
                  key={t.id}
                  to={`/tasks/${t.id}`}
                  className={[
                    'group block px-5 py-4 transition',
                    active ? 'bg-[rgb(var(--ring))]/[0.06]' : 'hover:bg-zinc-900/[0.02]',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{title(t)}</div>
                      <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                        {new Date(t.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusPill status={t.status} />
                      <ChevronRight className="h-4 w-4 text-zinc-500 transition group-hover:translate-x-0.5" />
                    </div>
                  </div>
                  {t.error ? <div className="mt-2 text-xs text-red-800/80">{t.error}</div> : null}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}
