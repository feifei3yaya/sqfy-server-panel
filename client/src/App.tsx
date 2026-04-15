import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp, Spin } from 'antd';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { setUser, logout } from './store/authSlice';
import { getMe } from './api/auth';
import api from './api/client';
import { getTheme } from './theme';
import MainLayout from './components/MainLayout';
import { LOGIN_PATH, PANEL_ROOT_PATH, legacyPanelPaths, panelPath, SITE_PATH, GUIDE_PATH, ABOUT_PATH, KITS_PATH, RULES_PATH } from './routes';

const Login = lazy(() => import('./pages/Login'));
const OfficialSite = lazy(() => import('./pages/OfficialSite'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const KitsPage = lazy(() => import('./pages/KitsPage'));
const NewbieGuide = lazy(() => import('./pages/NewbieGuide'));
const RulesPage = lazy(() => import('./pages/RulesPage'));
const Home = lazy(() => import('./pages/Home'));
const ServerList = lazy(() => import('./pages/ServerList'));
const PlayerList = lazy(() => import('./pages/PlayerList'));
const BanList = lazy(() => import('./pages/BanList'));
const RconTerminal = lazy(() => import('./pages/RconTerminal'));
const ConfigEditor = lazy(() => import('./pages/ConfigEditor'));
const SquadAdminManager = lazy(() => import('./pages/SquadAdminManager'));
const KillLogViewer = lazy(() => import('./pages/KillLogViewer'));
const ChatLogViewer = lazy(() => import('./pages/ChatLogViewer'));
const LogsViewer = lazy(() => import('./pages/LogsViewer'));
const SystemLogsViewer = lazy(() => import('./pages/SystemLogsViewer'));
const BroadcastManager = lazy(() => import('./pages/BroadcastManager'));
const CDKManager = lazy(() => import('./pages/CDKManager'));
const MatchCalendar = lazy(() => import('./pages/MatchCalendar'));
const MatchList = lazy(() => import('./pages/MatchList'));
const VIPManager = lazy(() => import('./pages/VIPManager'));
const UserList = lazy(() => import('./pages/UserList'));
const UserProfile = lazy(() => import('./pages/UserProfile'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Spin size="large" />
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to={LOGIN_PATH} replace />;
  }

  if (!user) {
    return <PageLoader />;
  }
  
  return <>{children}</>;
};

const RoleRoute = ({ children, roles }: { children: React.ReactNode; roles: string[] }) => {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return <PageLoader />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to={PANEL_ROOT_PATH} replace />;
  }

  return <>{children}</>;
};

function App() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const themeMode = useAppSelector((state) => state.theme.mode);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  useEffect(() => {
    const img = new Image();
    img.src = '/bg.jpg';
  }, []);

  useEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          dispatch(logout());
          navigate(LOGIN_PATH);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptorId);
    };
  }, [dispatch, navigate]);

  useEffect(() => {
    if (isAuthenticated && !user) {
      getMe()
        .then((response) => {
          dispatch(setUser(response.data));
        })
        .catch(() => {
          dispatch(logout());
        });
    }
  }, [isAuthenticated, user, dispatch]);
  
  return (
    <ConfigProvider theme={getTheme(themeMode)}>
      <AntdApp>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path={SITE_PATH} element={<OfficialSite />} />
            <Route path={ABOUT_PATH} element={<AboutPage />} />
            <Route path={KITS_PATH} element={<KitsPage />} />
            <Route path={GUIDE_PATH} element={<NewbieGuide />} />
            <Route path={RULES_PATH} element={<RulesPage />} />
            <Route path={LOGIN_PATH} element={isAuthenticated ? <Navigate to={PANEL_ROOT_PATH} replace /> : <Login />} />
            <Route path={PANEL_ROOT_PATH} element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Home />} />
              <Route path="servers" element={<ServerList />} />
              <Route path="servers/config" element={<ConfigEditor />} />
              <Route path="players" element={<PlayerList />} />
              <Route path="rcon" element={<RconTerminal />} />
              <Route path="game/broadcasts" element={<BroadcastManager />} />
              <Route path="bans" element={<BanList />} />
              <Route path="operation/cdk" element={<CDKManager />} />
              <Route path="operation/matches" element={<MatchList />} />
              <Route path="operation/vip" element={<VIPManager />} />
              <Route path="operation/calendar" element={<MatchCalendar />} />
              <Route
                path="users/list"
                element={
                  <RoleRoute roles={['superadmin']}>
                    <UserList />
                  </RoleRoute>
                }
              />
              <Route
                path="users/squad-admins"
                element={
                  <RoleRoute roles={['superadmin', 'admin']}>
                    <SquadAdminManager />
                  </RoleRoute>
                }
              />
              <Route path="logs">
                 <Route path="kill" element={<KillLogViewer />} />
                 <Route path="chat" element={<ChatLogViewer />} />
                 <Route path="console" element={<LogsViewer />} />
                 <Route path="system" element={<SystemLogsViewer />} />
              </Route>

              <Route path="profile" element={<UserProfile />} />
              <Route path="*" element={<Navigate to={PANEL_ROOT_PATH} replace />} />
            </Route>
            {legacyPanelPaths.map((path) => (
              <Route key={path} path={path} element={<Navigate to={panelPath(path)} replace />} />
            ))}
            <Route path="*" element={<Navigate to={SITE_PATH} replace />} />
          </Routes>
        </Suspense>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
