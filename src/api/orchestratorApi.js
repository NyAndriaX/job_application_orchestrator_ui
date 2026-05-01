import { httpClient } from './httpClient'

export const orchestratorApi = {
  healthCheck() {
    return httpClient.get('/')
  },

  // Auth
  register(payload) {
    return httpClient.post('/auth/register', payload)
  },
  login(payload) {
    return httpClient.post('/auth/login', payload)
  },

  // User settings
  savePlatformConfig(payload) {
    return httpClient.post('/users/platform-config', payload)
  },
  getPlatformConfig({ userId, platform } = {}) {
    const params = new URLSearchParams({ user_id: userId })
    if (platform) params.set('platform', platform)
    return httpClient.get(`/users/platform-config?${params}`)
  },
  saveUserProfile(payload) {
    return httpClient.post('/users/profile', payload)
  },
  getUserProfile({ userId } = {}) {
    const params = new URLSearchParams({ user_id: userId })
    return httpClient.get(`/users/profile?${params}`)
  },

  // Job applications
  listJobs({ userId, platform, status, limit } = {}) {
    const params = new URLSearchParams({ user_id: userId })
    if (platform) params.set('platform', platform)
    if (status) params.set('status', status)
    if (limit) params.set('limit', limit)
    return httpClient.get(`/jobs?${params}`)
  },

  // Scheduler tasks
  listSchedulerTasks({ limit } = {}) {
    const params = new URLSearchParams()
    if (limit) params.set('limit', limit)
    return httpClient.get(`/scheduler/tasks?${params}`)
  },

  // Orchestration
  orchestrate(payload) {
    return httpClient.post('/orchestrate', payload)
  },
}
