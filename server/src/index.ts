import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import path from 'path';
import { prisma } from './utils/prisma';
import authRoutes from './routes/authRoutes';
import serverRoutes from './routes/serverRoutes';
import playerRoutes from './routes/playerRoutes';
import cdkRoutes from './routes/cdkRoutes';
import squadAdminRoutes from './routes/squadAdminRoutes';
import broadcastRoutes from './routes/broadcastRoutes';
import logRoutes from './routes/logRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import configRoutes from './routes/configRoutes';
import permissionRoutes from './routes/permissionRoutes';
import userRoutes from './routes/userRoutes';
import matchRoutes from './routes/matchRoutes';
import systemLogRoutes from './routes/systemLogRoutes';
import matchCalendarRoutes from './routes/matchCalendarRoutes';
import whitelistRoutes from './routes/whitelistRoutes';
import playerNoteRoutes from './routes/playerNoteRoutes';
import gameEventRoutes from './routes/gameEventRoutes';
import systemRoutes from './routes/systemRoutes';
import rconService from './services/rconService';
import statsService from './services/statsService';
import pluginService from './services/pluginService';
import logService from './services/logService';
import broadcastService from './services/broadcastService';
import logWatcherService from './services/logWatcherService';
import systemLogWatcher from './services/systemLogWatcher';
import discordService from './services/discordService';
import backupService from './services/backupService';
import systemMonitorService from './services/systemMonitorService';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import fs from 'fs';

// ... (other imports)

// 初始化 RCON 和插件
(async () => {
  await pluginService.loadPlugins();
  // rconService 在其构造函数中初始化，这是正常的
})();

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // 在生产环境中应该限制为前端域名
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling']
});

const PORT = process.env.PORT || 3000;

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/cdk', cdkRoutes);
app.use('/api/squad-admins', squadAdminRoutes);
app.use('/api/broadcasts', broadcastRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/game-events', gameEventRoutes);
app.use('/api/system-logs', systemLogRoutes);
app.use('/api/calendar', matchCalendarRoutes);
app.use('/api/whitelist', whitelistRoutes);
app.use('/api/player-notes', playerNoteRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/servers', configRoutes); // Config 是 servers 的子资源

app.get('/', (req, res) => {
  res.send('Squad Server Manager API is running');
});

// 测试数据库连接的示例路由
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

app.use(notFoundHandler);
app.use(errorHandler);

io.on('connection', (socket: Socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('joinServer', (serverId: string) => {
    socket.join(`server:${serverId}`);
    console.log(`User ${socket.id} joined server room: ${serverId}`);
  });

  socket.on('leaveServer', (serverId: string) => {
    socket.leave(`server:${serverId}`);
    console.log(`User ${socket.id} left server room: ${serverId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// 使用 IO 初始化服务
rconService.setIO(io);
logService.setIO(io);
systemLogWatcher.setIO(io);

// ...

// 启动服务
statsService.startTracking();
broadcastService.initializeBroadcasts();
logWatcherService.setIO(io);
systemLogWatcher.start();
systemMonitorService.setIO(io);
systemMonitorService.start();
backupService.startScheduledBackup();
  
  (async () => {
    await discordService.connect(); // Start Discord Bot
  })();

  httpServer.listen(PORT, async () => {console.log(`Server is running on port ${PORT}`);

  // 初始化日志监听 (针对本地部署的特殊逻辑)
  try {
    const servers = await prisma.server.findMany();
    if (servers.length > 0) {
      // 尝试根据 filePath 推断日志路径
      let logPath = 'D:\\squad_server\\SquadGame\\Saved\\Logs\\SquadGame.log';
      
      if (servers[0].filePath) {
        // 假设 filePath 指向 ServerConfig 目录
        // 例如: D:\squad_server\SquadGame\ServerConfig
        // 日志通常在: D:\squad_server\SquadGame\Saved\Logs\SquadGame.log
        const serverRoot = path.dirname(servers[0].filePath); // D:\squad_server\SquadGame
        logPath = path.join(serverRoot, 'Saved', 'Logs', 'SquadGame.log');
      }
      
      console.log(`Initializing Log Watcher for server ${servers[0].name} at ${logPath}`);
      logWatcherService.watch(logPath, servers[0].id);
    } else {
        console.log('No servers found. Log watcher will not start until a server is added.');
    }
  } catch (error) {
    console.error('Failed to initialize log watcher:', error);
  }
});

// 优雅关闭
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});
