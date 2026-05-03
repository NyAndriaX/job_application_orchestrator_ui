import { useCallback, useEffect, useState, type ReactNode } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Collapse,
  Popconfirm,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd'
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { orchestratorApi } from '../api/orchestratorApi'
import { useApiRequest } from '../hooks/useApiRequest'
import type { SchedulerExecution, SchedulerStatus, SchedulerTask } from '../types'

const { Title, Text } = Typography

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '—'
  if (seconds < 60) return `${Math.round(seconds)}s`
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} h`
  return `${(seconds / 86400).toFixed(1)} d`
}

const STATUS_BADGE: Record<string, 'success' | 'processing' | 'error'> = {
  finished: 'success',
  running: 'processing',
  failed: 'error',
}

const STATUS_ICON: Record<string, ReactNode> = {
  finished: <CheckCircleOutlined className="text-emerald-500" />,
  running: <LoadingOutlined className="text-blue-500" />,
  failed: <CloseCircleOutlined className="text-red-500" />,
}

function ExecutionList({ executions }: { executions?: SchedulerExecution[] }) {
  if (!executions?.length) return <Text type="secondary">No executions recorded.</Text>

  const cols = [
    {
      title: 'User',
      dataIndex: 'user_id',
      key: 'user_id',
      render: (v: string | undefined) => (
        <Text code className="text-xs">
          {v}
        </Text>
      ),
    },
    {
      title: 'Platform',
      dataIndex: 'platform',
      key: 'platform',
      render: (v: string | undefined) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v: string | undefined) => <Tag color={v === 'success' ? 'green' : 'red'}>{v}</Tag>,
    },
    { title: 'Applied', dataIndex: 'applied_count', key: 'applied_count' },
    { title: 'Matched', dataIndex: 'offers_matched_count', key: 'offers_matched_count' },
    { title: 'Skipped', dataIndex: 'skipped_existing_count', key: 'skipped_existing_count' },
    {
      title: 'Executed at',
      dataIndex: 'executed_at',
      key: 'executed_at',
      render: (v: string | undefined) => (v ? new Date(v).toLocaleString() : '—'),
    },
    {
      title: 'Error',
      dataIndex: 'error',
      key: 'error',
      render: (v: string | undefined) =>
        v ? (
          <Text type="danger" className="text-xs">
            {v}
          </Text>
        ) : (
          '—'
        ),
    },
  ]

  return (
    <Table
      rowKey={(r: SchedulerExecution, i?: number) => `${r.user_id}-${r.platform}-${i ?? 0}`}
      dataSource={executions}
      columns={cols}
      pagination={false}
      size="small"
      scroll={{ x: 700 }}
    />
  )
}

function TaskCard({ task }: { task: SchedulerTask }) {
  const summary = task.summary || {}

  return (
    <Card
      className="shadow-xs"
      title={
        <Space wrap>
          {STATUS_ICON[task.status ?? ''] ?? <CalendarOutlined />}
          <span>{task.trigger === 'manual_run_now' ? 'Manual run' : 'Scheduled daily run'}</span>
          <Badge status={STATUS_BADGE[task.status ?? ''] ?? 'default'} text={task.status} />
        </Space>
      }
      extra={
        <Text type="secondary" className="text-xs">
          {task.started_at ? new Date(task.started_at).toLocaleString() : '—'}
        </Text>
      }
    >
      <Row gutter={[16, 16]} className="mb-4">
        {[
          { label: 'Executions', value: summary.executions ?? 0 },
          { label: 'Successes', value: summary.successes ?? 0, color: '#10b981' },
          { label: 'Failures', value: summary.failures ?? 0, color: '#ef4444' },
          { label: 'Applied', value: summary.applied_count ?? 0, color: '#6366f1' },
          { label: 'Matched offers', value: summary.offers_matched_count ?? 0 },
          { label: 'Skipped (dup)', value: summary.skipped_existing_count ?? 0 },
        ].map(({ label, value, color }) => (
          <Col key={label} xs={24} sm={12} md={8} lg={4}>
            <Statistic
              title={label}
              value={value}
              valueStyle={color ? { color, fontWeight: 700 } : { fontWeight: 700 }}
            />
          </Col>
        ))}
      </Row>

      {(task.executions?.length ?? 0) > 0 && (
        <Collapse
          ghost
          items={[
            {
              key: 'executions',
              label: (
                <Text type="secondary" className="text-sm">
                  {task.executions?.length ?? 0} execution detail
                  {(task.executions?.length ?? 0) !== 1 ? 's' : ''}
                </Text>
              ),
              children: <ExecutionList executions={task.executions} />,
            },
          ]}
        />
      )}
    </Card>
  )
}

export default function TasksPage() {
  const tasksReq = useApiRequest<{ tasks?: SchedulerTask[] }>()
  const statusReq = useApiRequest<SchedulerStatus>()
  const { run: runTasks } = tasksReq
  const { run: runStatus } = statusReq
  const [runNowLoading, setRunNowLoading] = useState(false)

  const refreshTasks = useCallback(() => {
    return runTasks(() => orchestratorApi.listSchedulerTasks({ limit: 50 }))
  }, [runTasks])

  const refreshStatus = useCallback(() => {
    return runStatus(() => orchestratorApi.getSchedulerStatus())
  }, [runStatus])

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshStatus(), refreshTasks()])
  }, [refreshStatus, refreshTasks])

  useEffect(() => {
    void refreshAll()
  }, [refreshAll])

  useEffect(() => {
    const id = window.setInterval(() => {
      void refreshStatus()
    }, 30_000)
    return () => window.clearInterval(id)
  }, [refreshStatus])

  const handleRunNow = async () => {
    setRunNowLoading(true)
    try {
      await orchestratorApi.runSchedulerNow()
      await refreshAll()
    } finally {
      setRunNowLoading(false)
    }
  }

  const tasks = tasksReq.data?.tasks ?? []
  const loading = tasksReq.loading
  const status = statusReq.data
  const statusLoading = statusReq.loading

  const nextRunLabel =
    status?.next_run_at_local_iso != null
      ? new Date(status.next_run_at_local_iso).toLocaleString(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : '—'

  return (
    <Space orientation="vertical" size="large" className="w-full">
      <div>
        <Title level={4} className="mb-1!">
          Scheduler tasks
        </Title>
        <Text type="secondary">History of automated and manual orchestration runs.</Text>
      </div>

      <Card className="shadow-xs" loading={statusLoading && !status}>
        <Space orientation="vertical" size="middle" className="w-full">
          {status?.scheduler_enabled === false && (
            <Alert
              type="warning"
              showIcon
              message="Automatic scheduler is disabled"
              description="The background scheduler is off (SCHEDULER_ENABLED). You can still run a manual job below."
            />
          )}
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={14}>
              <Space align="start" size="middle">
                <ClockCircleOutlined className="text-xl text-indigo-500 mt-1" />
                <div>
                  <Text strong>Next automatic run</Text>
                  <div className="text-lg font-semibold">{nextRunLabel}</div>
                  <Text type="secondary" className="text-sm">
                    In ~{formatDuration(status?.seconds_until_next ?? NaN)} · slot{' '}
                    <Text code>{status?.next_slot_local ?? '—'}</Text> ({status?.timezone ?? '—'})
                  </Text>
                  <div className="mt-1">
                    <Text type="secondary" className="text-xs">
                      Daily times: {(status?.target_times ?? []).join(', ') || '—'}
                    </Text>
                  </div>
                </div>
              </Space>
            </Col>
            <Col xs={24} md={10} className="text-left md:text-right">
              <Space wrap className="justify-end">
                <Button icon={<ReloadOutlined />} onClick={() => void refreshAll()} loading={statusLoading}>
                  Refresh
                </Button>
                <Popconfirm
                  title="Run auto-apply now?"
                  description="This starts the same flow as the scheduled job for every user and configured platform. It may take several minutes."
                  okText="Run"
                  cancelText="Cancel"
                  onConfirm={() => void handleRunNow()}
                >
                  <Button
                    type="primary"
                    icon={<ThunderboltOutlined />}
                    loading={runNowLoading}
                    disabled={runNowLoading}
                  >
                    Run now
                  </Button>
                </Popconfirm>
              </Space>
            </Col>
          </Row>
        </Space>
      </Card>

      {loading && (
        <Card className="shadow-xs">
          <Text type="secondary">Loading tasks...</Text>
        </Card>
      )}

      {!loading && tasks.length === 0 && (
        <Card className="shadow-xs">
          <Text type="secondary">No scheduler tasks have run yet.</Text>
        </Card>
      )}

      {tasks.map((task) => (
        <TaskCard key={task.task_id} task={task} />
      ))}
    </Space>
  )
}
