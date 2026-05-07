import { useEffect, useState } from 'react'
import { Card } from './Card'

export function MarkdownPreview(props: { url: string | null }) {
  const [text, setText] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!props.url) {
      setText('')
      setError(null)
      return
    }
    let canceled = false
    setLoading(true)
    setError(null)
    fetch(props.url)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return await r.text()
      })
      .then((t) => {
        if (canceled) return
        setText(t)
      })
      .catch((e) => {
        if (canceled) return
        setError(e instanceof Error ? e.message : '加载失败')
      })
      .finally(() => {
        if (canceled) return
        setLoading(false)
      })
    return () => {
      canceled = true
    }
  }, [props.url])

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-[rgb(var(--border))] px-5 py-4">
        <div className="font-[var(--serif)] text-lg tracking-tight">index.md 预览</div>
        <div className="mt-1 text-xs text-[rgb(var(--muted))]">当前为纯文本预览；建议下载后用 Markdown 阅读器打开。</div>
      </div>
      <div className="max-h-[520px] overflow-auto px-5 py-4">
        {loading ? <div className="text-sm text-[rgb(var(--muted))]">加载中...</div> : null}
        {error ? <div className="text-sm text-red-800/80">{error}</div> : null}
        {!loading && !error && !text ? <div className="text-sm text-[rgb(var(--muted))]">暂无内容</div> : null}
        {text ? (
          <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-5 text-zinc-900/90">{text}</pre>
        ) : null}
      </div>
    </Card>
  )
}

