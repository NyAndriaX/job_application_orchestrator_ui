import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd'
import { LockOutlined, RocketOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { orchestratorApi } from '../api/orchestratorApi'
import { useAuth } from '../context/AuthContext'
import { useApiRequest } from '../hooks/useApiRequest'

const { Title, Text } = Typography

function LoginForm({ onSuccess }) {
  const { loading, error, run } = useApiRequest()

  const onFinish = async (values) => {
    const result = await run(() => orchestratorApi.login(values))
    if (result?.user) onSuccess(result.user)
  }

  return (
    <Form layout="vertical" onFinish={onFinish} size="large" className="w-full">
      {error && <Alert type="error" showIcon message={error} className="mb-4" />}
      <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Valid email required' }]}>
        <Input
          size="large"
          prefix={<UserOutlined className="text-slate-400" />}
          placeholder="Email address"
          className="h-12"
        />
      </Form.Item>
      <Form.Item name="password" rules={[{ required: true, message: 'Password is required' }]}>
        <Input.Password
          size="large"
          prefix={<LockOutlined className="text-slate-400" />}
          placeholder="Password"
          className="h-12"
        />
      </Form.Item>
      <Button block type="primary" htmlType="submit" loading={loading} size="large" className="h-12 text-base">
        Sign in
      </Button>
    </Form>
  )
}

export default function AuthPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSuccess = (userData) => {
    signIn(userData)
    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden flex-col justify-between bg-indigo-600 p-10 text-white lg:flex lg:w-2/5 xl:p-12">
        <Space>
          <RocketOutlined className="text-2xl" />
          <Text strong className="text-lg text-white!">Job Orchestrator</Text>
        </Space>
        <Space direction="vertical" size="large">
          <Title level={2} className="text-white! leading-tight">
            Automate your<br />job applications.
          </Title>
          <Text className="text-indigo-200 text-base">
            Connect your platforms, set your filters, and let the orchestrator apply for you — daily, automatically.
          </Text>
        </Space>
        <Text className="text-indigo-300 text-sm">© 2026 Job Application Orchestrator</Text>
      </div>

      <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md sm:max-w-xl lg:max-w-lg">
          <Space direction="vertical" size={6} className="mb-5 sm:mb-8 w-full">
            <div className="flex items-center gap-2 lg:hidden">
              <RocketOutlined className="text-indigo-600 text-xl" />
              <Text strong className="text-base">Job Orchestrator</Text>
            </div>
            <Title level={2} className="mb-0!">Welcome</Title>
            <Text type="secondary">Sign in to access your private dashboard.</Text>
          </Space>

          <Card className="shadow-sm" classNames={{ body: 'p-4 sm:p-6' }}>
            <LoginForm onSuccess={handleSuccess} />
          </Card>
        </div>
      </div>
    </div>
  )
}
