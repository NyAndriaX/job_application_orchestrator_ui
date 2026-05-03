import { httpClient } from './httpClient'
import type { AuthResponse, JobRecord, SchedulerStatus, SchedulerTask } from '../types'

type ApiMessage = { message?: string; [key: string]: unknown }

interface UserProfileResponse extends ApiMessage {
  profile?: {
    filters?: unknown[]
    skills?: unknown[]
    excluded_keywords?: unknown[]
    min_relevance_score?: number | string
    max_jobs?: number | string
  }
}

interface PlatformConfigResponse extends ApiMessage {
  config?: {
    auth?: {
      email?: string
      password?: string
    }
  }
}

interface JobsResponse extends ApiMessage {
  jobs?: JobRecord[]
}

interface SchedulerTasksResponse extends ApiMessage {
  tasks?: SchedulerTask[]
}

export const orchestratorApi = {
  healthCheck() {
    return httpClient.get<ApiMessage>('/')
  },

  register(payload: Record<string, unknown>) {
    return httpClient.post<AuthResponse>('/auth/register', payload)
  },
  login(payload: Record<string, unknown>) {
    return httpClient.post<AuthResponse>('/auth/login', payload)
  },

  savePlatformConfig(payload: Record<string, unknown>) {
    return httpClient.post<ApiMessage>('/users/platform-config', payload)
  },
  getPlatformConfig({ userId, platform }: { userId?: string; platform?: string } = {}) {
    const params = new URLSearchParams({ user_id: userId ?? '' })
    if (platform) params.set('platform', platform)
    return httpClient.get<PlatformConfigResponse>(`/users/platform-config?${params}`)
  },
  saveUserProfile(payload: Record<string, unknown>) {
    return httpClient.post<ApiMessage>('/users/profile', payload)
  },
  getUserProfile({ userId }: { userId?: string } = {}) {
    const params = new URLSearchParams({ user_id: userId ?? '' })
    return httpClient.get<UserProfileResponse>(`/users/profile?${params}`)
  },

  listJobs({
    userId,
    platform,
    status,
    limit,
  }: { userId?: string; platform?: string; status?: string; limit?: number } = {}) {
    const params = new URLSearchParams({ user_id: userId ?? '' })
    if (platform) params.set('platform', platform)
    if (status) params.set('status', status)
    if (limit) params.set('limit', String(limit))
    return httpClient.get<JobsResponse>(`/jobs?${params}`)
  },

  listSchedulerTasks({ limit }: { limit?: number } = {}) {
    const params = new URLSearchParams()
    if (limit) params.set('limit', String(limit))
    return httpClient.get<SchedulerTasksResponse>(`/scheduler/tasks?${params}`)
  },

  getSchedulerStatus() {
    return httpClient.get<SchedulerStatus>('/scheduler/status')
  },

  runSchedulerNow() {
    return httpClient.post<{
      success?: boolean
      summary?: Record<string, unknown>
    }>('/scheduler/run-now')
  },

  orchestrate(payload: Record<string, unknown>) {
    return httpClient.post<ApiMessage>('/orchestrate', payload)
  },
}
