export type JobStatus = 'applied' | 'skipped' | 'failed' | 'error' | string

export interface User {
  user_id: string
  full_name: string
  email: string
}

export interface AuthResponse {
  user?: User
  message?: string
}

export interface JobRecord {
  job_title?: string
  job_company?: string
  job_contract?: string
  job_url?: string
  platform?: string
  status?: JobStatus
  applied_at?: string
  message?: string
}

export interface SchedulerExecution {
  user_id?: string
  platform?: string
  status?: string
  applied_count?: number
  offers_matched_count?: number
  skipped_existing_count?: number
  executed_at?: string
  error?: string
}

export interface SchedulerTask {
  task_id?: string
  status?: string
  trigger?: string
  started_at?: string
  summary?: {
    executions?: number
    successes?: number
    failures?: number
    applied_count?: number
    offers_matched_count?: number
    skipped_existing_count?: number
  }
  executions?: SchedulerExecution[]
}
