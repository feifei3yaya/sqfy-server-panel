import React, { useEffect, useMemo, useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, theme, Button, Tooltip, Switch, Grid } from 'antd';
import type { MenuProps } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  CloudServerOutlined,
  TeamOutlined,
  StopOutlined,
  FileTextOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CalendarOutlined,
  CrownOutlined,
  SunOutlined,
  MoonOutlined
} from '@ant-design/icons';
import { logout } from '../store/authSlice';
import { toggleTheme } from '../store/themeSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import LogoMark from './LogoMark';
import { LOGIN_PATH, SITE_PATH, panelPath } from '../routes';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const themeMode = useAppSelector((state) => state.theme.mode);
  const {
    token: { borderRadiusLG, colorPrimary, colorText, colorBorderSecondary, colorBgContainer },
  } = theme.useToken();

  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
      return;
    }
    setCollapsed(false);
  }, [isMobile]);

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate(LOGIN_PATH);
  };

  const userMenu: MenuProps = {
    items: [
      {
        key: 'profile',
        label: '个人资料',
        icon: <UserOutlined />,
        onClick: () => navigate(panelPath('/profile')),
      },
      {
        type: 'divider',
      },
      {
        key: 'logout',
        label: '退出登录',
        icon: <LogoutOutlined />,
        danger: true,
        onClick: handleLogout,
      },
    ],
  };

  const menuItems = useMemo(() => [
    {
      key: panelPath(),
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: 'server-group',
      label: '服务器管理',
      icon: <CloudServerOutlined />,
      children: [
        { key: panelPath('/servers'), label: '服务器列表' },
        { key: panelPath('/servers/config'), label: '配置文件' },
      ]
    },
    {
      key: 'game-group',
      label: '游戏管理',
      icon: <TeamOutlined />,
      children: [
        { key: panelPath('/players'), label: '游戏面板' },
        { key: panelPath('/operation/matches'), label: '历史对局' },
        { key: panelPath('/rcon'), label: 'RCON终端' },
        { key: panelPath('/game/broadcasts'), label: '广播消息' },
        { key: panelPath('/logs/chat'), label: '聊天日志' },
        { key: panelPath('/logs/kill'), label: '击杀日志' },
        { key: panelPath('/logs/console'), label: '控制台日志' },
      ]
    },
    {
      key: 'ops-group',
      label: '运营中心',
      icon: <StopOutlined />,
      children: [
        { key: panelPath('/bans'), label: '封禁名单' },
        { key: panelPath('/operation/cdk'), label: 'CDK管理' },
        { key: panelPath('/operation/vip'), label: 'VIP 管理', icon: <CrownOutlined /> },
        { key: panelPath('/operation/calendar'), label: '排班日历', icon: <CalendarOutlined /> },
      ]
    },
    {
      key: 'user-group',
      label: '人员管理',
      icon: <UserOutlined />,
      children: [
        { key: panelPath('/users/list'), label: '平台用户' },
        { key: panelPath('/users/squad-admins'), label: '游戏管理员' },
      ]
    },
    {
      key: panelPath('/logs'),
      icon: <FileTextOutlined />,
      label: '日志查看',
      children: [
        { key: panelPath('/logs/system'), label: '系统日志', icon: <FileTextOutlined /> },
      ]
    },
  ], []);

  const visibleMenuItems = useMemo(() => {
    const role = user?.role || 'observer';
    if (role === 'superadmin') {
      return menuItems;
    }
    if (role === 'admin') {
      return menuItems.filter((item) => item.key !== panelPath('/logs') && item.key !== 'user-group').concat({
        key: panelPath('/logs'),
        icon: <FileTextOutlined />,
        label: '日志查看',
        children: [{ key: panelPath('/logs/system'), label: '系统日志', icon: <FileTextOutlined /> }]
      });
    }
    return menuItems.filter((item) => item.key !== 'user-group');
  }, [menuItems, user?.role]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible={false}
        collapsed={collapsed}
        theme={themeMode === 'dark' ? 'dark' : 'light'}
        width={250}
        collapsedWidth={isMobile ? 0 : 80}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          boxShadow: 'var(--shell-shadow)',
          backgroundColor: colorBgContainer,
          borderRight: `1px solid ${colorBorderSecondary}`,
          backdropFilter: 'blur(10px)',
          transform: isMobile && collapsed ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.2s ease'
        }}
      >
        <div className="flex items-center justify-center py-4 border-b" style={{ borderColor: colorBorderSecondary }}>
          <LogoMark size={collapsed ? 'sm' : 'md'} />
          {!collapsed && (
            <span className="ml-3 font-bold text-lg tracking-wider" style={{ color: colorPrimary }}>
              SQUAD
            </span>
          )}
        </div>
        <Menu
          theme={themeMode === 'dark' ? 'dark' : 'light'}
          mode="inline"
          defaultSelectedKeys={[location.pathname]}
          selectedKeys={[location.pathname]}
          items={visibleMenuItems}
          onClick={({ key }) => {
            navigate(key);
            if (isMobile) {
              setCollapsed(true);
            }
          }}
          className="bg-transparent"
        />
      </Sider>
      {isMobile && !collapsed && (
        <div
          className="fixed inset-0 bg-black/40"
          style={{ zIndex: 99 }}
          onClick={() => setCollapsed(true)}
        />
      )}
      <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 250), transition: 'margin-left 0.2s' }}>
        <Header style={{ padding: '0 24px', background: colorBgContainer, backdropFilter: 'blur(10px)', borderBottom: `1px solid ${colorBorderSecondary}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 99 }}>
          <div className="flex items-center gap-4">
            <Tooltip title={collapsed ? '展开侧边栏' : '收起侧边栏'}>
              <Button 
                type="text" 
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className="h-8 w-8"
              />
            </Tooltip>
            <div className="text-lg font-semibold" style={{ color: colorText }}>战术小队面板</div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<HomeOutlined />}
              onClick={() => navigate(SITE_PATH)}
              className="hidden md:inline-flex"
            >
              官网
            </Button>
            <Tooltip title={themeMode === 'dark' ? '切换到白天模式' : '切换到黑暗模式'}>
              <div className="flex items-center gap-2">
                {themeMode === 'dark' ? <SunOutlined /> : <MoonOutlined />}
                <Switch
                  checked={themeMode === 'dark'}
                  onChange={handleToggleTheme}
                  checkedChildren="暗"
                  unCheckedChildren="亮"
                />
              </div>
            </Tooltip>
            <Dropdown menu={userMenu} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer px-3 py-1 rounded transition-colors panel-mask">
                <Avatar icon={<UserOutlined />} src={user?.avatarUrl} />
                <span className="font-medium hidden md:inline">{user?.nickname || user?.username || '管理员'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: 'transparent',
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
