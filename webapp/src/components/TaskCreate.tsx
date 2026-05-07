import { useMemo, useState } from 'react'
import { Globe, ImageDown, Loader2, Play, UserRound } from 'lucide-react'
import { Card } from './Card'
import type { CreateTaskRequest, TaskType } from '../shared/types'

const typeMeta: Record<TaskType, { label: string; icon: any }> = {
  search: { label: '关键词搜索', icon: Globe },
  user: { label: '用户主页', icon: UserRound },
  note: { label: '笔记链接', icon: Play },
}

export function TaskCreate(props: {
  onOpenLogin: () => Promise<void>
  onCreate: (payload: CreateTaskRequest) => Promise<void>
  busy?: boolean
}) {
  const [type, setType] = useState<TaskType>('search')
  const [keyword, setKeyword] = useState('')
  const [url, setUrl] = useState('')
  const [limit, setLimit] = useState(30)
  const [downloadMedia, setDownloadMedia] = useState(false)
  const [localBusy, setLocalBusy] = useState<'none' | 'login' | 'create'>('none')

  const payload = useMemo<CreateTaskRequest>(() => {
    const base: CreateTaskRequest = { type, limit, downloadMedia }
    if (type === 'search') base.keyword = keyword.trim()
    else base.url = url.trim()
    return base
  }, [type, keyword, url, limit, downloadMedia])

  const canSubmit = useMemo(() => {
    if (type === 'search') return keyword.trim().length > 0
    return url.trim().length > 0
  }, [type, keyword, url])

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-[var(--serif)] text-lg tracking-tight">新建任务</div>
          <div className="mt-1 text-sm text-[rgb(var(--muted))]">
            登录需要在运行主机弹出浏览器窗口；远程服务器请使用远程桌面/带 GUI 的环境。
          </div>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-sm font-medium shadow-[0_10px_30px_rgba(0,0,0,0.10)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(0,0,0,0.14)] disabled:opacity-60"
          disabled={props.busy || localBusy !== 'none'}
          onClick={async () => {
            setLocalBusy('login')
            try {
              await props.onOpenLogin()
            } finally {
              setLocalBusy('none')
            }
          }}
        >
          {localBusy === 'login' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          打开登录浏览器
        </button>
      </div>

      <div className="mt-5 grid gap-4">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {(Object.keys(typeMeta) as TaskType[]).map((t) => {
            const Icon = typeMeta[t].icon
            const active = t === type
            return (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={[
                  'group flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition',
                  active
                    ? 'border-[rgb(var(--ring))]/40 bg-[rgb(var(--ring))]/[0.06] shadow-[0_18px_50px_rgba(185,28,28,0.12)]'
                    : 'border-[rgb(var(--border))] bg-[rgb(var(--card))] hover:bg-zinc-900/[0.02]',
                ].join(' ')}
              >
                <span
                  className={[
                    'grid h-10 w-10 place-items-center rounded-2xl border',
                    active
                      ? 'border-[rgb(var(--ring))]/30 bg-[rgb(var(--ring))]/10 text-[rgb(var(--ring))]'
                      : 'border-[rgb(var(--border))] bg-[rgb(var(--card))] text-zinc-700',
                  ].join(' ')}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-sm font-semibold tracking-tight">{typeMeta[t].label}</div>
                  <div className="text-xs text-[rgb(var(--muted))]">{t === 'note' ? '单条详情' : '列表 + 批量详情'}</div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-[rgb(var(--muted))]">
              {type === 'search' ? '关键词' : '链接'}
            </label>
            <input
              value={type === 'search' ? keyword : url}
              onChange={(e) => (type === 'search' ? setKeyword(e.target.value) : setUrl(e.target.value))}
              placeholder={type === 'search' ? '例如：露营装备' : '粘贴小红书分享链接'}
              className="mt-1 w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-sm outline-none ring-0 focus:border-[rgb(var(--ring))]/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[rgb(var(--muted))]">条数上限</label>
            <input
              type="number"
              value={limit}
              min={1}
              max={200}
              onChange={(e) => setLimit(Number(e.target.value || 30))}
              className="mt-1 w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-sm outline-none ring-0 focus:border-[rgb(var(--ring))]/50"
            />
            <div className="mt-2 flex items-center gap-2">
              <input
                id="downloadMedia"
                type="checkbox"
                checked={downloadMedia}
                onChange={(e) => setDownloadMedia(e.target.checked)}
                className="h-4 w-4 rounded border-[rgb(var(--border))]"
              />
              <label htmlFor="downloadMedia" className="inline-flex items-center gap-2 text-xs text-[rgb(var(--muted))]">
                <ImageDown className="h-4 w-4" />
                下载图片并写入 Markdown
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-[rgb(var(--muted))]">
            {type === 'note' ? '笔记任务会直接抓取详情。' : '列表任务会先提取链接，再批量抓取详情。'}
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-[rgb(var(--ring))] px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(185,28,28,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_80px_rgba(185,28,28,0.34)] disabled:opacity-50"
            disabled={!canSubmit || props.busy || localBusy !== 'none'}
            onClick={async () => {
              setLocalBusy('create')
              try {
                await props.onCreate(payload)
              } finally {
                setLocalBusy('none')
              }
            }}
          >
            {localBusy === 'create' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            创建并入队
          </button>
        </div>
      </div>
    </Card>
  )
}

