import { useEffect, useState } from 'react'
import { Card, Input, Select, Space, Table, Tag, Typography } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { orchestratorApi } from '../api/orchestratorApi'
import { useAuth } from '../context/AuthContext'
import { useApiRequest } from '../hooks/useApiRequest'

const { Title, Text } = Typography

const STATUS_COLORS = {
  applied: 'green',
  skipped: 'gold',
  failed: 'red',
  error: 'red',
  unknown: 'default',
}

const PLATFORMS = [
  { value: '', label: 'All platforms' },
  { value: 'asako', label: 'Asako' },
  { value: 'getyourjob', label: 'GetYourJob' },
]

const STATUSES = [
  { value: '', label: 'All statuses' },
  { value: 'applied', label: 'Applied' },
  { value: 'skipped', label: 'Skipped' },
  { value: 'failed', label: 'Failed' },
]

const COLUMNS = [
  {
    title: 'Job title',
    dataIndex: 'job_title',
    key: 'job_title',
    render: (v, row) =>
      row.job_url ? (
        <a href={row.job_url} target="_blank" rel="noreferrer" className="font-medium text-indigo-600">
          {v || '—'}
        </a>
      ) : (
        <span className="font-medium">{v || '—'}</span>
      ),
  },
  {
    title: 'Company',
    dataIndex: 'job_company',
    key: 'job_company',
    render: (v) => v || '—',
  },
  {
    title: 'Contract',
    dataIndex: 'job_contract',
    key: 'job_contract',
    render: (v) => (v ? <Tag>{v}</Tag> : '—'),
  },
  {
    title: 'Platform',
    dataIndex: 'platform',
    key: 'platform',
    render: (v) => <Tag color="blue">{v}</Tag>,
    filters: PLATFORMS.filter((p) => p.value).map((p) => ({ text: p.label, value: p.value })),
    onFilter: (value, record) => record.platform === value,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (v) => <Tag color={STATUS_COLORS[v] ?? 'default'}>{v}</Tag>,
    filters: STATUSES.filter((s) => s.value).map((s) => ({ text: s.label, value: s.value })),
    onFilter: (value, record) => record.status === value,
  },
  {
    title: 'Applied at',
    dataIndex: 'applied_at',
    key: 'applied_at',
    sorter: (a, b) => new Date(a.applied_at) - new Date(b.applied_at),
    defaultSortOrder: 'descend',
    render: (v) => (v ? new Date(v).toLocaleString() : '—'),
  },
  {
    title: 'Message',
    dataIndex: 'message',
    key: 'message',
    render: (v) => <Text type="secondary" className="text-xs">{v || '—'}</Text>,
  },
]

export default function JobsPage() {
  const { user } = useAuth()
  const { loading, data, run } = useApiRequest()
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    run(() => orchestratorApi.listJobs({ userId: user.user_id, platform, status, limit: 200 }))
  }, [user.user_id, platform, status])

  const jobs = (data?.jobs ?? []).filter((j) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (j.job_title || '').toLowerCase().includes(q) ||
      (j.job_company || '').toLowerCase().includes(q)
    )
  })

  return (
    <Space direction="vertical" size="large" className="w-full">
      <div>
        <Title level={4} className="mb-1!">Applied jobs</Title>
        <Text type="secondary">All job applications recorded by the orchestrator.</Text>
      </div>

      <Card className="shadow-xs">
        <Space wrap size={[8, 8]} className="mb-4 w-full">
          <Input
            prefix={<SearchOutlined className="text-slate-400" />}
            placeholder="Search by title or company"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64"
            allowClear
          />
          <Select
            value={platform}
            onChange={setPlatform}
            options={PLATFORMS}
            className="w-full sm:w-44"
          />
          <Select
            value={status}
            onChange={setStatus}
            options={STATUSES}
            className="w-full sm:w-40"
          />
          <Text type="secondary" className="text-sm">
            {jobs.length} result{jobs.length !== 1 ? 's' : ''}
          </Text>
        </Space>

        <Table
          rowKey={(r) => `${r.platform}-${r.job_url}`}
          dataSource={jobs}
          columns={COLUMNS}
          loading={loading}
          pagination={{ pageSize: 20, showSizeChanger: true, pageSizeOptions: [10, 20, 50] }}
          scroll={{ x: 900 }}
          locale={{ emptyText: 'No job applications found.' }}
          size="middle"
        />
      </Card>
    </Space>
  )
}
