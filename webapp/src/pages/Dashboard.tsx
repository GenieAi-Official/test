import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { HeaderBar } from '../components/HeaderBar'
import { TaskCreate } from '../components/TaskCreate'
import { TaskDetail } from '../components/TaskDetail'
import { TaskList } from '../components/TaskList'
import { useTasksStore } from '../store/tasks'
import type { CreateTaskRequest } from '../shared/types'

export default function Dashboard() {
  const params = useParams()
  const navigate = useNavigate()
  const login = useTasksStore((s) => s.login)
  const tasks = useTasksStore((s) => s.tasks)
  const selectedId = useTasksStore((s) => s.selectedId)
  const selected = useTasksStore((s) => s.selected)
  const busy = useTasksStore((s) => s.busy)
  const error = useTasksStore((s) => s.error)
  const refreshAll = useTasksStore((s) => s.refreshAll)
  const refreshSelected = useTasksStore((s) => s.refreshSelected)
  const select = useTasksStore((s) => s.select)
  const runOpenLogin = useTasksStore((s) => s.runOpenLogin)
  const runCreateTask = useTasksStore((s) => s.runCreateTask)

  useEffect(() => {
    void refreshAll()
  }, [refreshAll])

  useEffect(() => {
    const id = params.id || null
    if (id !== selectedId) select(id)
  }, [params.id, selectedId, select])

  useEffect(() => {
    if (!selectedId) return
    void refreshSelected()
  }, [selectedId, refreshSelected])

  useEffect(() => {
    const t = window.setInterval(() => {
      void refreshAll()
      void refreshSelected()
    }, 2000)
    return () => window.clearInterval(t)
  }, [refreshAll, refreshSelected])

  return (
    <div className="min-h-screen">
      <HeaderBar login={login} />
      <div className="mx-auto grid max-w-[1200px] gap-4 px-6 py-6 lg:grid-cols-[420px_1fr]">
        <div className="grid gap-4">
          <TaskCreate
            busy={busy}
            headfulAvailable={login?.headfulAvailable}
            onOpenLogin={runOpenLogin}
            onCreate={async (payload: CreateTaskRequest) => {
              const t = await runCreateTask(payload)
              navigate(`/tasks/${t.id}`)
            }}
          />
          <TaskList tasks={tasks} selectedId={selectedId} />
          {error ? (
            <div className="rounded-2xl border border-red-600/20 bg-red-500/10 px-4 py-3 text-sm text-red-900">
              {error}
            </div>
          ) : null}
        </div>
        <div className="grid gap-4">
          <TaskDetail task={selected} onRefresh={refreshSelected} busy={busy} />
        </div>
      </div>
    </div>
  )
}
