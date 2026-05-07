export type TaskType = 'search' | 'user' | 'note'

export type TaskStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'canceled'

export interface CreateTaskRequest {
  type: TaskType
  keyword?: string
  url?: string
  limit?: number
  downloadMedia?: boolean
}

export interface TaskSummary {
  id: string
  type: TaskType
  status: TaskStatus
  createdAt: string
  startedAt?: string
  finishedAt?: string
  error?: string
}

export interface Artifact {
  name: string
  path: string
  size: number
}

export interface TaskDetail extends TaskSummary {
  params: CreateTaskRequest
  logs: string[]
  artifacts: Artifact[]
  indexMdPath?: string
}

export type LoginStatus = 'unknown' | 'logged_in' | 'not_logged_in'

export interface LoginStatusResponse {
  status: LoginStatus
  message: string
  headfulAvailable?: boolean
}
