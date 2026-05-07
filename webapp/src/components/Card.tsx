import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

export function Card(props: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-[var(--shadow)]',
        props.className,
      )}
    >
      {props.children}
    </div>
  )
}

