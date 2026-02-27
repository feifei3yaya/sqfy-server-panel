import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ConfigProvider } from 'antd';
import type { RootState } from './store';
import Login from './pages/Login';
import ServerList from './pages/ServerList';
import PlayerList from './pages/PlayerList';
import CDKManager from './pages/CDKManager';
import LogsViewer from './pages/LogsViewer';
import SquadAdminManager from './pages/SquadAdminManager';
import BroadcastManager from './pages/BroadcastManager';
import ChatLogViewer from './pages/ChatLogViewer';
import TeamList from './pages/TeamList';
import KillLogViewer from './pages/KillLogViewer';
import AttendanceReport from './pages/AttendanceReport';
import Dashboard from './pages/Dashboard';
import ConfigEditor from './pages/ConfigEditor';
import MainLayout from './components/MainLayout';
import { appTheme } from './theme';

const PrivateRoute = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ConfigProvider theme={appTheme}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/servers" element={<ServerList />} />
              <Route path="/players" element={<PlayerList />} />
              <Route path="/cdk" element={<CDKManager />} />
              <Route path="/configs" element={<ConfigEditor />} />
              <Route path="/chat-logs" element={<ChatLogViewer />} />
              <Route path="/kill-logs" element={<KillLogViewer />} />
              <Route path="/teams" element={<TeamList />} />
              <Route path="/logs" element={<LogsViewer />} />
              <Route path="/broadcasts" element={<BroadcastManager />} />
              <Route path="/attendance" element={<AttendanceReport />} />
              <Route path="/admins" element={<SquadAdminManager />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
