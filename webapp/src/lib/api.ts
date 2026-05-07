import type { CreateTaskRequest, LoginStatusResponse, TaskDetail, TaskSummary } from '../shared/types'

async function api<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const msg = json?.error || json?.message || `HTTP ${res.status}`
    throw new Error(msg)
  }
  if (json?.success === false) throw new Error(json?.error || '请求失败')
  return (json?.data ?? json) as T
}

export async function openLogin(waitSeconds: number = 600): Promise<void> {
  await api('/api/login/open', { method: 'POST', body: JSON.stringify({ waitSeconds }) })
}

export async function getLoginStatus(): Promise<LoginStatusResponse> {
  return await api<LoginStatusResponse>('/api/login/status', { method: 'GET' })
}

export async function createTask(payload: CreateTaskRequest): Promise<TaskDetail> {
  return await api<TaskDetail>('/api/tasks', { method: 'POST', body: JSON.stringify(payload) })
}

export async function listTasks(): Promise<TaskSummary[]> {
  return await api<TaskSummary[]>('/api/tasks', { method: 'GET' })
}

export async function getTask(id: string): Promise<TaskDetail> {
  return await api<TaskDetail>(`/api/tasks/${id}`, { method: 'GET' })
}

export function indexMdUrl(id: string): string {
  return `/api/tasks/${id}/index.md`
}

export function downloadUrl(id: string): string {
  return `/api/tasks/${id}/download`
}
