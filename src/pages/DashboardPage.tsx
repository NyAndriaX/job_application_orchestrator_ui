import { useEffect, type ReactNode } from 'react'
import { Button, Card, Col, Row, Skeleton, Space, Statistic, Table, Tag, Timeline, Typography } from 'antd'
import {
  BankOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  RocketOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { orchestratorApi } from '../api/orchestratorApi'
import { useAuth } from '../context/AuthContext'
import { useApiRequest } from '../hooks/useApiRequest'
import type { JobRecord, SchedulerTask } from '../types'

const { Title, Text } = Typography

function StatCard({
  icon,
  label,
  value,
  color,
  loading,
}: {
  icon: ReactNode
  label: string
  value: number
  color: string
  loading: boolean
}) {
  return (
    <Card className="shadow-xs h-full">
      <Skeleton loading={loading} active paragraph={false}>
        <Statistic
          title={
            <Space>
              {icon}
              <span>{label}</span>
            </Space>
          }
          value={value}
          valueStyle={{ color, fontSize: 28, fontWeight: 700 }}
        />
      </Skeleton>
    </Card>
  )
}

const STATUS_COLORS: Record<string, string> = {
  applied: 'green',
  skipped: 'gold',
  failed: 'red',
  error: 'red',
  unknown: 'default',
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const jobsReq = useApiRequest<{ jobs?: JobRecord[] }>()
  const tasksReq = useApiRequest<{ tasks?: SchedulerTask[] }>()
  const { run: runJobs } = jobsReq
  const { run: runTasks } = tasksReq

  useEffect(() => {
    if (!user?.user_id) return
    runJobs(() => orchestratorApi.listJobs({ userId: user.user_id, limit: 5 }))
    runTasks(() => orchestratorApi.listSchedulerTasks({ limit: 5 }))
  }, [user?.user_id, runJobs, runTasks])

  const jobs = jobsReq.data?.jobs ?? []
  const tasks = tasksReq.data?.tasks ?? []

  const totalApplied = jobs.filter((j) => j.status === 'applied').length
  const totalSkipped = jobs.filter((j) => j.status === 'skipped').length
  const totalFailed = jobs.filter((j) => ['failed', 'error'].includes(j.status ?? '')).length

  const recentJobColumns = [
    {
      title: 'Job title',
      dataIndex: 'job_title',
      key: 'job_title',
      render: (v: string | undefined, row: JobRecord) =>
        row.job_url ? (
          <a href={row.job_url} target="_blank" rel="noreferrer" className="font-medium">
            {v || '—'}
          </a>
        ) : (
          <span className="font-medium">{v || '—'}</span>
        ),
    },
    { title: 'Company', dataIndex: 'job_company', key: 'job_company', render: (v: string | undefined) => v || '—' },
    {
      title: 'Platform',
      dataIndex: 'platform',
      key: 'platform',
      render: (v: string | undefined) => <Tag>{v}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v: string | undefined) => <Tag color={STATUS_COLORS[v ?? 'unknown'] ?? 'default'}>{v}</Tag>,
    },
    {
      title: 'Applied at',
      dataIndex: 'applied_at',
      key: 'applied_at',
      render: (v: string | undefined) => (v ? new Date(v).toLocaleString() : '—'),
    },
  ]

  return (
    <Space orientation="vertical" size="large" className="w-full">
      <div>
        <Title level={4} className="mb-1!">
          Dashboard
        </Title>
        <Text type="secondary">Overview of your job application activity.</Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <StatCard
            loading={jobsReq.loading}
            icon={<CheckCircleOutlined className="text-emerald-500" />}
            label="Applied (recent)"
            value={totalApplied}
            color="#10b981"
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            loading={jobsReq.loading}
            icon={<ClockCircleOutlined className="text-amber-500" />}
            label="Skipped"
            value={totalSkipped}
            color="#f59e0b"
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            loading={jobsReq.loading}
            icon={<CloseCircleOutlined className="text-red-500" />}
            label="Failed"
            value={totalFailed}
            color="#ef4444"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={15}>
          <Card
            className="shadow-xs"
            title={
              <Space>
                <BankOutlined className="text-indigo-600" />
                <span>Recent applied jobs</span>
              </Space>
            }
            extra={
              <Button type="link" className="px-0!" onClick={() => navigate('/jobs')}>
                See all
              </Button>
            }
          >
            <Table
              rowKey={(r: JobRecord) => r.job_url ?? `${r.platform}-${r.job_title}`}
              dataSource={jobs}
              columns={recentJobColumns}
              pagination={false}
              loading={jobsReq.loading}
              size="small"
              scroll={{ x: 720 }}
              locale={{ emptyText: 'No jobs recorded yet.' }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={9}>
          <Card
            className="shadow-xs"
            title={
              <Space>
                <CalendarOutlined className="text-indigo-600" />
                <span>Recent scheduler runs</span>
              </Space>
            }
            extra={
              <Button type="link" className="px-0!" onClick={() => navigate('/tasks')}>
                See all
              </Button>
            }
          >
            {tasksReq.loading ? (
              <Skeleton active />
            ) : tasks.length === 0 ? (
              <Text type="secondary">No scheduler tasks yet.</Text>
            ) : (
              <Timeline
                items={tasks.map((t) => ({
                  color: t.status === 'finished' ? 'green' : t.status === 'running' ? 'blue' : 'gray',
                  dot:
                    t.status === 'finished' ? (
                      <CheckCircleOutlined />
                    ) : t.status === 'running' ? (
                      <RocketOutlined />
                    ) : undefined,
                  children: (
                    <Space orientation="vertical" size={0}>
                      <Text strong className="text-sm">
                        {t.trigger === 'manual_run_now' ? 'Manual run' : 'Scheduled run'}
                      </Text>
                      <Text type="secondary" className="text-xs">
                        {t.started_at ? new Date(t.started_at).toLocaleString() : '—'}
                      </Text>
                      <Space size={4} className="mt-1" wrap>
                        <Tag color="green" className="text-xs">
                          {t.summary?.applied_count ?? 0} applied
                        </Tag>
                        <Tag color="default" className="text-xs">
                          {t.summary?.executions ?? 0} runs
                        </Tag>
                      </Space>
                    </Space>
                  ),
                }))}
              />
            )}
          </Card>
        </Col>
      </Row>
    </Space>
  )
}
