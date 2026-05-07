import { cn } from '../lib/utils'
import type { TaskStatus } from '../shared/types'

const styles: Record<TaskStatus, string> = {
  queued: 'bg-zinc-900/5 text-zinc-800 border-zinc-900/10',
  running: 'bg-amber-500/15 text-amber-900 border-amber-600/20',
  succeeded: 'bg-emerald-500/15 text-emerald-900 border-emerald-600/20',
  failed: 'bg-red-500/15 text-red-900 border-red-600/20',
  canceled: 'bg-zinc-500/10 text-zinc-700 border-zinc-600/15',
}

const labels: Record<TaskStatus, string> = {
  queued: '排队',
  running: '运行中',
  succeeded: '成功',
  failed: '失败',
  canceled: '已取消',
}

export function StatusPill(props: { status: TaskStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium',
        styles[props.status],
        props.className,
      )}
    >
      {labels[props.status]}
    </span>
  )
}

