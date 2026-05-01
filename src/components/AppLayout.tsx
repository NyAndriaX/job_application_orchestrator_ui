import { useState, type ReactNode } from 'react'
import { Avatar, Button, Drawer, Grid, Dropdown, Layout, Menu, Space, Typography } from 'antd'
import type { MenuProps } from 'antd'
import {
  BankOutlined,
  CalendarOutlined,
  MenuOutlined,
  LogoutOutlined,
  RocketOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const { Sider, Header, Content } = Layout
const { Text } = Typography

type NavItem = { key: string; icon: React.ReactNode; label: string }

const NAV_ITEMS: NavItem[] = [
  { key: '/dashboard', icon: <RocketOutlined />, label: 'Dashboard' },
  { key: '/jobs', icon: <BankOutlined />, label: 'Applied jobs' },
  { key: '/tasks', icon: <CalendarOutlined />, label: 'Scheduler tasks' },
  { key: '/settings', icon: <SettingOutlined />, label: 'Settings' },
]

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md
  const [mobileOpen, setMobileOpen] = useState(false)

  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U'

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'info',
      label: (
        <Space orientation="vertical" size={0} className="py-1">
          <Text strong>{user?.full_name || 'User'}</Text>
          <Text type="secondary" className="text-xs">
            {user?.email}
          </Text>
        </Space>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'signout',
      icon: <LogoutOutlined />,
      label: 'Sign out',
      danger: true,
      onClick: signOut,
    },
  ]

  const onMenuNavigate = (key: string) => {
    navigate(key)
    if (isMobile) setMobileOpen(false)
  }

  const navMenu = (
    <Menu
      mode="inline"
      selectedKeys={[pathname]}
      items={NAV_ITEMS as MenuProps['items']}
      onClick={({ key }) => onMenuNavigate(key)}
      className="border-none! pt-2"
    />
  )

  return (
    <Layout className="min-h-screen">
      {!isMobile && (
        <Sider
          theme="light"
          width={220}
          className="fixed! left-0 top-0 h-screen border-r border-slate-100 shadow-sm"
        >
          <div className="flex h-14 items-center gap-2 border-b border-slate-100 px-5">
            <RocketOutlined className="text-indigo-600 text-lg" />
            <Text strong className="text-slate-800 truncate">
              Job Orchestrator
            </Text>
          </div>
          {navMenu}
        </Sider>
      )}

      <Layout className={isMobile ? 'ml-0' : 'ml-[220px]'}>
        <Header className="flex h-14 items-center justify-between border-b border-slate-100 bg-white! px-4 sm:px-6">
          <Space size={8}>
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setMobileOpen(true)}
                className="-ml-1"
                aria-label="Open navigation menu"
              />
            )}
            <Text type="secondary" className="text-sm font-medium">
              {isMobile ? 'Job Orchestrator' : NAV_ITEMS?.find((i) => i?.key === pathname)?.label ?? ''}
            </Text>
          </Space>
          <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
            <Button type="text" className="flex items-center gap-2 px-2!">
              <Avatar size={32} style={{ backgroundColor: '#4f46e5' }}>
                {initials}
              </Avatar>
              <Text className="hidden sm:block">{user?.full_name?.split(' ')[0] ?? 'User'}</Text>
            </Button>
          </Dropdown>
        </Header>

        <Content className="bg-slate-50 p-3 sm:p-5 lg:p-6">{children}</Content>
      </Layout>
      {isMobile && (
        <Drawer
          title={
            <Space size={8}>
              <RocketOutlined className="text-indigo-600" />
              <span>Job Orchestrator</span>
            </Space>
          }
          placement="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          width={260}
          styles={{ body: { padding: 0 } }}
        >
          {navMenu}
        </Drawer>
      )}
    </Layout>
  )
}
