import { api } from "./api"

export type TaskStatusApi = "pendente" | "em_andamento" | "concluida" | "overdue"

export interface Task {
  id: number
  title: string
  description: string
  status: TaskStatusApi
  priority: "low" | "medium" | "high"
  due_date: string
  created_at: string
  updated_at: string
  assignees?: TaskAssignee[]
}

export interface TaskAssignee {
  id: number
  name: string
  email: string
  avatar?: string
}

export type TaskStatusPtBr = "pendente" | "em_andamento" | "concluida"

export const STATUS_MAP: Record<TaskStatusApi, TaskStatusPtBr> = {
  pendente: "pendente",
  em_andamento: "em_andamento",
  concluida: "concluida",
  overdue: "em_andamento",
}

export const STATUS_MAP_REVERSE: Record<TaskStatusPtBr, TaskStatusApi> = {
  pendente: "pendente",
  em_andamento: "em_andamento",
  concluida: "concluida",
}

export interface TaskPtBr extends Omit<Task, "status"> {
  status: TaskStatusPtBr
}

export function mapTaskFromApi(task: Task): TaskPtBr {
  const mappedStatus = STATUS_MAP[task.status] || task.status;
  return {
    ...task,
    status: mappedStatus as TaskStatusPtBr,
  }
}

export interface TaskFilters {
  status?: TaskStatusPtBr
  priority?: Task["priority"]
  search?: string
  start_date?: string
  end_date?: string
  page?: number
  per_page?: number
  sort_by?: string
  order?: "asc" | "desc"
}

export interface TaskStats {
  total_tasks: number
  pending_tasks: number
  in_progress_tasks: number
  completed_tasks: number
  completion_rate: number
  overdue_tasks: number
}

export interface CreateTaskPayload {
  title: string
  description?: string
  status?: Task["status"]
  priority?: Task["priority"]
  due_date?: string
  assignee_ids?: number[]
}

export interface UpdateTaskPayload {
  title?: string
  description?: string
  status?: Task["status"]
  priority?: Task["priority"]
  due_date?: string
  assignee_ids?: number[]
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}

export interface ApiErrorResponse {
  message: string
  errors?: Record<string, string[]>
}

export async function getTasks(filters?: TaskFilters): Promise<PaginatedResponse<Task>> {
  const params = new URLSearchParams()
  if (filters?.status) params.append("status", filters.status)
  if (filters?.priority) params.append("priority", filters.priority)
  if (filters?.search) params.append("search", filters.search)
  if (filters?.start_date) params.append("start_date", filters.start_date)
  if (filters?.end_date) params.append("end_date", filters.end_date)
  if (filters?.page) params.append("page", String(filters.page))
  if (filters?.per_page) params.append("per_page", String(filters.per_page))
  if (filters?.sort_by) params.append("sort_by", filters.sort_by)
  if (filters?.order) params.append("order", filters.order)

  const query = params.toString() ? `?${params.toString()}` : ""
  const { data } = await api.get<PaginatedResponse<Task>>(`tasks${query}`)
  return data
}

export async function getStats(): Promise<TaskStats> {
  const { data } = await api.get<TaskStats>("tasks/stats")
  return data
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const { data } = await api.post<Task>("tasks", payload)
  return data
}

export async function updateTask(id: number, payload: UpdateTaskPayload): Promise<Task> {
  const { data } = await api.put<Task>(`tasks/${id}`, payload)
  return data
}

export async function deleteTask(id: number): Promise<void> {
  await api.delete(`tasks/${id}`)
}

export async function getTaskById(id: number): Promise<Task> {
  const { data } = await api.get<Task>(`tasks/${id}`)
  return data
}

export interface Comment {
  id: number
  content: string
  created_at: string
  user: {
    id: number
    name: string
    email: string
  }
}

export async function getComments(taskId: number): Promise<Comment[]> {
  const { data } = await api.get<Comment[]>(`tasks/${taskId}/comments`)
  return data
}

export async function createComment(taskId: number, content: string): Promise<Comment> {
  const { data } = await api.post<Comment>(`tasks/${taskId}/comments`, { content })
  return data
}

export interface Attachment {
  id: number
  task_id: number
  original_name: string
  file_path: string
  size: number
  mime_type: string
  created_at: string
  updated_at: string
}

export async function getAttachments(taskId: number): Promise<Attachment[]> {
  const { data } = await api.get<Attachment[]>(`tasks/${taskId}/attachments`)
  return data
}

export async function uploadAttachment(
  taskId: number, 
  file: File, 
  onProgress?: (percent: number) => void
): Promise<Attachment> {
  const formData = new FormData()
  formData.append("file", file)

  const { data } = await api.post<Attachment>(`tasks/${taskId}/attachments`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percentCompleted)
      }
    },
  })
  return data
}

export async function deleteAttachment(taskId: number, attachmentId: number): Promise<void> {
  await api.delete(`tasks/${taskId}/attachments/${attachmentId}`)
}

export async function downloadAttachment(taskId: number, attachmentId: number): Promise<Blob> {
  const { data } = await api.get(`tasks/${taskId}/attachments/${attachmentId}`, {
    responseType: "blob",
  })
  return data
}