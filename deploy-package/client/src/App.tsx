import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp, Spin } from 'antd';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { setUser, logout } from './store/authSlice';
import { getMe } from './api/auth';
import api from './api/client';
import { getTheme } from './theme';

// Components
import MainLayout from './components/MainLayout';
// import ErrorBoundary from './components/ErrorBoundary'; // Already wrapping App in main.tsx

// Pages
import Login from './pages/Login';
import Home from './pages/Home';
import ServerList from './pages/ServerList';
import PlayerList from './pages/PlayerList';
import BanList from './pages/BanList';
import RconTerminal from './pages/RconTerminal';
import ConfigEditor from './pages/ConfigEditor';
import SquadAdminManager from './pages/SquadAdminManager';
import KillLogViewer from './pages/KillLogViewer';
import ChatLogViewer from './pages/ChatLogViewer';
import LogsViewer from './pages/LogsViewer'; // Game Console logs
import SystemLogsViewer from './pages/SystemLogsViewer'; // System logs
import BroadcastManager from './pages/BroadcastManager';
import CDKManager from './pages/CDKManager';
import MatchCalendar from './pages/MatchCalendar';
import MatchList from './pages/MatchList';
import VIPManager from './pages/VIPManager';
import UserList from './pages/UserList';
import UserProfile from './pages/UserProfile';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }
  
  return <>{children}</>;
};

const RoleRoute = ({ children, roles }: { children: React.ReactNode; roles: string[] }) => {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/" replace />;
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
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          dispatch(logout());
          navigate('/login');
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
        <Routes>
        <Route path="/login" element={<Login />} />
        
          <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Home />} />
            
            {/* Server Group */}
            <Route path="servers" element={<ServerList />} />
            <Route path="servers/config" element={<ConfigEditor />} />

            {/* Game Group */}
            <Route path="players" element={<PlayerList />} />
            <Route path="rcon" element={<RconTerminal />} />
            <Route path="game/broadcasts" element={<BroadcastManager />} />

            {/* Ops Group */}
            <Route path="bans" element={<BanList />} />
            <Route path="operation/cdk" element={<CDKManager />} />
            <Route path="operation/matches" element={<MatchList />} />
            <Route path="operation/vip" element={<VIPManager />} />
            <Route path="operation/calendar" element={<MatchCalendar />} />

            {/* User Group */}
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
            
            {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
