import { create } from 'zustand'
import type { CreateTaskRequest, LoginStatusResponse, TaskDetail, TaskSummary } from '../shared/types'
import { createTask, getLoginStatus, getTask, listTasks, openLogin } from '../lib/api'

type State = {
  login: LoginStatusResponse | null
  tasks: TaskSummary[]
  selectedId: string | null
  selected: TaskDetail | null
  busy: boolean
  refreshing: boolean
  error: string | null
  refreshAll: () => Promise<void>
  refreshSelected: () => Promise<void>
  select: (id: string | null) => void
  runOpenLogin: () => Promise<void>
  runCreateTask: (payload: CreateTaskRequest) => Promise<TaskDetail>
}

export const useTasksStore = create<State>((set, get) => ({
  login: null,
  tasks: [],
  selectedId: null,
  selected: null,
  busy: false,
  refreshing: false,
  error: null,
  select: (id) => set({ selectedId: id }),
  refreshAll: async () => {
    set({ refreshing: true })
    try {
      const [login, tasks] = await Promise.all([getLoginStatus(), listTasks()])
      set({ login, tasks })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : '刷新失败' })
    } finally {
      set({ refreshing: false })
    }
  },
  refreshSelected: async () => {
    const id = get().selectedId
    if (!id) return
    try {
      const detail = await getTask(id)
      set({ selected: detail })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : '刷新失败' })
    }
  },
  runOpenLogin: async () => {
    set({ error: null, busy: true })
    try {
      await openLogin(600)
      await get().refreshAll()
    } finally {
      set({ busy: false })
    }
  },
  runCreateTask: async (payload) => {
    set({ error: null, busy: true })
    try {
      const detail = await createTask(payload)
      set({ selectedId: detail.id, selected: detail })
      await get().refreshAll()
      return detail
    } finally {
      set({ busy: false })
    }
  },
}))
