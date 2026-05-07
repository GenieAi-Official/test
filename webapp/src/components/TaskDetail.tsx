import { ExternalLink, FileDown, RefreshCw } from 'lucide-react'
import { Card } from './Card'
import { StatusPill } from './StatusPill'
import { MarkdownPreview } from './MarkdownPreview'
import type { TaskDetail as TaskDetailType } from '../shared/types'
import { downloadUrl, indexMdUrl } from '../lib/api'

export function TaskDetail(props: { task: TaskDetailType | null; onRefresh: () => Promise<void>; busy?: boolean }) {
  if (!props.task) {
    return (
      <Card className="p-10 text-center text-sm text-[rgb(var(--muted))]">
        选择一个任务查看详情，或先创建新任务。
      </Card>
    )
  }

  const task = props.task
  const idxUrl = task.indexMdPath ? indexMdUrl(task.id) : null
  const dlUrl = downloadUrl(task.id)

  return (
    <div className="grid gap-4">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="font-[var(--serif)] text-lg tracking-tight">任务详情</div>
            <div className="mt-1 text-xs text-[rgb(var(--muted))]">{task.id}</div>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill status={task.status} />
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-sm font-medium transition hover:bg-zinc-900/[0.02] disabled:opacity-60"
              disabled={props.busy}
              onClick={props.onRefresh}
            >
              <RefreshCw className="h-4 w-4" />
              刷新
            </button>
            <a
              className="inline-flex items-center gap-2 rounded-xl bg-[rgb(var(--ring))] px-3 py-2 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(185,28,28,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_80px_rgba(185,28,28,0.34)]"
              href={dlUrl}
            >
              <FileDown className="h-4 w-4" />
              下载产物
            </a>
          </div>
        </div>

        <div className="mt-4 grid gap-2 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[rgb(var(--muted))]">创建时间</span>
            <span>{new Date(task.createdAt).toLocaleString()}</span>
          </div>
          {task.startedAt ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[rgb(var(--muted))]">开始时间</span>
              <span>{new Date(task.startedAt).toLocaleString()}</span>
            </div>
          ) : null}
          {task.finishedAt ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[rgb(var(--muted))]">结束时间</span>
              <span>{new Date(task.finishedAt).toLocaleString()}</span>
            </div>
          ) : null}
          {task.error ? <div className="text-sm text-red-800/80">错误：{task.error}</div> : null}
        </div>

        {idxUrl ? (
          <div className="mt-4">
            <a className="inline-flex items-center gap-2 text-sm font-medium text-[rgb(var(--ring))]" href={idxUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
              打开 index.md
            </a>
          </div>
        ) : null}
      </Card>

      <MarkdownPreview url={idxUrl} />

      <Card className="overflow-hidden">
        <div className="border-b border-[rgb(var(--border))] px-5 py-4">
          <div className="font-[var(--serif)] text-lg tracking-tight">日志</div>
        </div>
        <div className="max-h-[320px] overflow-auto px-5 py-4">
          {task.logs.length === 0 ? (
            <div className="text-sm text-[rgb(var(--muted))]">暂无日志</div>
          ) : (
            <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-5 text-zinc-900/90">
              {task.logs.join('\n')}
            </pre>
          )}
        </div>
      </Card>
    </div>
  )
}

