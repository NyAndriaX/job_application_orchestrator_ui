import { useEffect, type ReactNode } from 'react'
import { Alert, Button, Card, Col, Form, Input, Row, Select, Space, Typography } from 'antd'
import { LockOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons'
import { orchestratorApi } from '../api/orchestratorApi'
import { useAuth } from '../context/AuthContext'
import { useApiRequest } from '../hooks/useApiRequest'

const { Title, Text } = Typography

function normalizeArrayInput(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((item) => String(item).trim()).filter(Boolean)
}

function SectionTitle({ children, description }: { children: ReactNode; description?: string }) {
  return (
    <div className="mb-4">
      <Title level={5} className="mb-0!">
        {children}
      </Title>
      {description && (
        <Text type="secondary" className="text-sm">
          {description}
        </Text>
      )}
    </div>
  )
}

function ProfileSection() {
  const { user } = useAuth()
  const { loading, error, data, run, reset } = useApiRequest<{ message?: string; profile?: Record<string, unknown> }>()
  const [form] = Form.useForm()

  useEffect(() => {
    if (!user?.user_id) return
    run(() => orchestratorApi.getUserProfile({ userId: user.user_id })).then((result) => {
      if (!result?.profile) return
      const profile = result.profile
      form.setFieldsValue({
        filters: normalizeArrayInput(profile.filters),
        skills: normalizeArrayInput(profile.skills),
        excluded_keywords: normalizeArrayInput(profile.excluded_keywords),
        min_relevance_score: Number.isFinite(Number(profile.min_relevance_score))
          ? Number(profile.min_relevance_score)
          : 1,
        max_jobs: Number.isFinite(Number(profile.max_jobs)) ? Number(profile.max_jobs) : 20,
      })
    })
  }, [form, run, user?.user_id])

  const onFinish = (values: Record<string, unknown>) => {
    if (!user?.user_id) return
    reset()
    run(() =>
      orchestratorApi.saveUserProfile({
        user_id: user.user_id,
        filters: normalizeArrayInput(values.filters),
        skills: normalizeArrayInput(values.skills),
        excluded_keywords: normalizeArrayInput(values.excluded_keywords),
        min_relevance_score: Number(values.min_relevance_score),
        max_jobs: Number(values.max_jobs),
      }),
    )
  }

  return (
    <Card className="shadow-xs">
      <SectionTitle description="Set the search filters and preferences used by the orchestrator when applying to jobs.">
        Search preferences
      </SectionTitle>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          filters: ['cdi', 'stage'],
          skills: [],
          excluded_keywords: [],
          min_relevance_score: 1,
          max_jobs: 20,
        }}
      >
        <Row gutter={[16, 0]}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Job filters"
              name="filters"
              tooltip="Array of contract types used by the backend."
              rules={[{ required: true }]}
            >
              <Select
                mode="tags"
                tokenSeparators={[',']}
                placeholder="Add filters (e.g. cdi, stage)"
                options={[
                  { value: 'cdi', label: 'cdi' },
                  { value: 'stage', label: 'stage' },
                  { value: 'alternance', label: 'alternance' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Skills" name="skills" tooltip="Array of skills used for relevance matching.">
              <Select mode="tags" tokenSeparators={[',']} placeholder="Add skills (e.g. python, react, docker)" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Excluded keywords" name="excluded_keywords" tooltip="Array of keywords to exclude.">
          <Select mode="tags" tokenSeparators={[',']} placeholder="Add excluded keywords (e.g. senior, lead)" />
        </Form.Item>

        <Row gutter={[16, 0]}>
          <Col xs={24} md={12}>
            <Form.Item label="Min. relevance score" name="min_relevance_score" rules={[{ required: true }]}>
              <Input type="number" min={0} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Max. jobs per run" name="max_jobs" rules={[{ required: true }]}>
              <Input type="number" min={1} />
            </Form.Item>
          </Col>
        </Row>

        {error && <Alert type="error" showIcon message={error} className="mb-3" />}
        {data?.message && <Alert type="success" showIcon message={data.message} className="mb-3" />}

        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          icon={<SaveOutlined />}
          className="w-full sm:w-auto"
        >
          Save preferences
        </Button>
      </Form>
    </Card>
  )
}

function PlatformSection() {
  const { user } = useAuth()
  const { loading, error, data, run, reset } = useApiRequest<{ message?: string; config?: Record<string, unknown> }>()
  const [form] = Form.useForm()

  useEffect(() => {
    if (!user?.user_id) return
    run(() => orchestratorApi.getPlatformConfig({ userId: user.user_id, platform: 'asako' })).then((result) => {
      const auth = (result?.config?.auth ?? {}) as { email?: string }
      form.setFieldsValue({
        platform: 'asako',
        email: typeof auth.email === 'string' ? auth.email : undefined,
      })
    })
  }, [form, run, user?.user_id])

  const onFinish = (values: Record<string, string>) => {
    if (!user?.user_id) return
    reset()
    run(() =>
      orchestratorApi.savePlatformConfig({
        user_id: user.user_id,
        platform: values.platform,
        auth: { email: values.email, password: values.password },
      }),
    )
  }

  return (
    <Card className="shadow-xs">
      <SectionTitle description="Store the credentials the orchestrator will use to log in to each platform on your behalf.">
        Platform credentials
      </SectionTitle>

      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ platform: 'asako' }}>
        <Form.Item label="Platform" name="platform" rules={[{ required: true }]}>
          <Select
            options={[
              { value: 'asako', label: 'Asako' },
              { value: 'getyourjob', label: 'GetYourJob' },
            ]}
          />
        </Form.Item>

        <Row gutter={[16, 0]}>
          <Col xs={24} md={12}>
            <Form.Item label="Platform email" name="email" rules={[{ required: true, type: 'email' }]}>
              <Input prefix={<UserOutlined />} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Platform password" name="password" rules={[{ required: true }]}>
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>
          </Col>
        </Row>

        {error && <Alert type="error" showIcon message={error} className="mb-3" />}
        {data?.message && <Alert type="success" showIcon message={data.message} className="mb-3" />}

        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          icon={<SaveOutlined />}
          className="w-full sm:w-auto"
        >
          Save credentials
        </Button>
      </Form>
    </Card>
  )
}

function AccountSection() {
  const { user } = useAuth()

  return (
    <Card className="shadow-xs">
      <SectionTitle description="Your account information. Email and name are set at registration.">
        Account information
      </SectionTitle>
      <Space direction="vertical" size="middle" className="w-full">
        {[
          { label: 'User ID', value: user?.user_id },
          { label: 'Full name', value: user?.full_name },
          { label: 'Email', value: user?.email },
        ].map(({ label, value }) => (
          <Row key={label} gutter={[8, 6]}>
            <Col xs={24} sm={6}>
              <Text type="secondary">{label}</Text>
            </Col>
            <Col xs={24} sm={18}>
              <Text strong>{value || '—'}</Text>
            </Col>
          </Row>
        ))}
      </Space>
    </Card>
  )
}

export default function SettingsPage() {
  return (
    <Space direction="vertical" size="large" className="w-full">
      <div>
        <Title level={4} className="mb-1!">
          Settings
        </Title>
        <Text type="secondary">Manage your profile preferences and platform credentials.</Text>
      </div>
      <AccountSection />
      <ProfileSection />
      <PlatformSection />
    </Space>
  )
}
