import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ConfigProvider, Avatar, Dropdown, Space, Menu, Button, theme, Layout, Drawer, Grid } from 'antd';
import { 
  UserOutlined, 
  DashboardOutlined, 
  CloudServerOutlined, 
  TeamOutlined, 
  FileTextOutlined,
  CodeOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
  SoundOutlined,
  ScheduleOutlined,
  SafetyCertificateOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  KeyOutlined,
  MessageOutlined,
  AimOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { logout } from '../store/authSlice';
import DutyWidget from './DutyWidget';
import LogoMark from './LogoMark';
import { useSidebarLayout } from '../hooks/useSidebarLayout';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const MainLayout: React.FC = () => {
  const { t } = useTranslation();
  const screens = useBreakpoint();
  const isMobile = !screens.md; // consider mobile if screen width < 768px (md breakpoint)
  
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user);
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  
  const { contentStyle } = useSidebarLayout(sidebarRef, !!isMobile);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: t('menu.dashboard') },
    { key: '/servers', icon: <CloudServerOutlined />, label: t('menu.servers') },
    { key: '/players', icon: <UserOutlined />, label: t('menu.players') },
    { key: '/cdk', icon: <KeyOutlined />, label: t('menu.cdk') },
    { key: '/chat-logs', icon: <MessageOutlined />, label: t('menu.chatLogs') },
    { key: '/kill-logs', icon: <AimOutlined />, label: t('menu.killLogs') },
    { key: '/teams', icon: <TeamOutlined />, label: t('menu.teams') },
    { key: '/configs', icon: <FileTextOutlined />, label: t('menu.configs') },
    { key: '/logs', icon: <CodeOutlined />, label: t('menu.logs') },
    { key: '/broadcasts', icon: <SoundOutlined />, label: t('menu.broadcasts') },
    { key: '/attendance', icon: <ScheduleOutlined />, label: t('menu.attendance') },
    { key: '/admins', icon: <SafetyCertificateOutlined />, label: t('menu.admins') },
  ];

  const userMenu: MenuProps['items'] = [
    {
      key: 'logout',
      label: t('menu.logout'),
      icon: <LogoutOutlined />,
      onClick: () => dispatch(logout()),
    },
  ];

  return (
    <Layout className="min-h-screen bg-transparent">
      {/* Mobile Drawer Navigation */}
      {isMobile && (
          <Drawer
            placement="left"
            onClose={() => setMobileDrawerOpen(false)}
            open={mobileDrawerOpen}
            width={240}
            styles={{ body: { padding: 0, backgroundColor: 'rgba(15, 17, 21, 0.95)' } }}
            closable={false}
            className="dark"
          >
            <div className="h-16 flex items-center justify-center border-b border-amber-500/20 bg-transparent">
              <div className="mr-3">
                <LogoMark size="sm" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold text-white tracking-[0.1em] leading-none">SQUAD</span>
                <span className="text-[10px] text-amber-500 font-mono tracking-[0.2em] leading-none mt-0.5">PANEL</span>
              </div>
            </div>
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[location.pathname]}
              items={menuItems}
              onClick={({ key }) => {
                navigate(key);
                setMobileDrawerOpen(false);
              }}
              className="border-r-0 bg-transparent"
            />
          </Drawer>
        )}

        {/* Desktop Sider */}
        {!isMobile && (
          <div ref={sidebarRef} className="fixed left-0 top-0 bottom-0 z-10">
            <Sider 
              trigger={null} 
              collapsible 
              collapsed={collapsed}
              theme="dark"
              className="shadow-xl h-full overflow-auto border-r border-amber-500/20 backdrop-blur-md bg-[#0b0c10]/85"
              width={240}
            >
              <div className={`h-16 flex items-center justify-center border-b border-amber-500/20 overflow-hidden whitespace-nowrap ${collapsed ? 'px-2' : ''}`}>
                <div className={`transition-all duration-300 ${collapsed ? 'scale-110' : 'mr-3'}`}>
                  <LogoMark size="sm" />
                </div>
                <div className={`flex flex-col transition-all duration-300 ${collapsed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100'}`}>
                  <span className="text-lg font-extrabold text-white tracking-widest leading-none">{t('app.title')}</span>
                  <span className="text-[10px] text-amber-500 font-bold tracking-[0.2em] leading-none mt-1">{t('app.subtitle')}</span>
                </div>
              </div>
              <Menu
                theme="dark"
                mode="inline"
                selectedKeys={[location.pathname]}
                items={menuItems}
                onClick={({ key }) => navigate(key)}
                className="border-r-0 mt-2 bg-transparent font-medium"
              />
            </Sider>
          </div>
        )}

        <Layout 
          className="flex flex-col bg-transparent w-full"
          style={contentStyle}
        >
          <Header 
            className="px-4 sticky top-0 z-10 w-full flex justify-between items-center shadow-md border-b border-amber-500/20 backdrop-blur-md bg-[#0b0c10]/80"
            style={{ paddingInline: isMobile ? 12 : 24 }}
          >
            <Button
              type="text"
              icon={isMobile ? <MenuUnfoldOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
              onClick={() => isMobile ? setMobileDrawerOpen(true) : setCollapsed(!collapsed)}
              className="text-lg w-10 h-10 text-amber-500 hover:text-amber-400"
              aria-label={collapsed ? "Expand menu" : "Collapse menu"}
            />
            
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-[10px] text-gray-500 font-bold tracking-widest leading-none mb-1">{t('user.operator')}</span>
                <span className="text-amber-500 font-bold tracking-wide uppercase leading-none">{user?.username}</span>
              </div>
              
              <div className="h-8 w-px bg-white/10 mx-2 hidden md:block"></div>

              <DutyWidget />
              
              <Dropdown menu={{ items: userMenu }} trigger={['click']}>
                <Space className="cursor-pointer hover:bg-amber-500/10 p-1.5 rounded-sm transition-all border border-transparent hover:border-amber-500/30 group">
                  <Avatar 
                    icon={<UserOutlined />} 
                    className="bg-amber-600/80 text-black group-hover:bg-amber-500 transition-colors" 
                    shape="square" 
                    size="small"
                  />
                  <span className="hidden md:inline text-gray-300 font-medium group-hover:text-white transition-colors text-sm">{user?.username}</span>
                </Space>
              </Dropdown>
            </div>
          </Header>
          
          <Content className="h-[calc(100vh-64px)] overflow-hidden bg-[#0b0c10]">
            <div className="h-full w-full overflow-y-auto custom-scrollbar p-4 md:p-6">
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Layout>
  );
};

export default MainLayout;
