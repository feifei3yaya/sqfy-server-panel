import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/authRoutes';
import serverRoutes from './routes/serverRoutes';
import playerRoutes from './routes/playerRoutes';
import cdkRoutes from './routes/cdkRoutes';
import squadAdminRoutes from './routes/squadAdminRoutes';
import broadcastRoutes from './routes/broadcastRoutes';
import logRoutes from './routes/logRoutes';
import teamRoutes from './routes/teamRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import configRoutes from './routes/configRoutes';
import rconService from './services/rconService';
import statsService from './services/statsService';
import pluginService from './services/pluginService';

// ... (other imports)

// Initialize RCON and Plugins
(async () => {
  await pluginService.loadPlugins();
  // rconService initializes in its constructor, which is fine
})();
import logService from './services/logService';
import broadcastService from './services/broadcastService';

dotenv.config();

const prisma = new PrismaClient();
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

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/cdk', cdkRoutes);
app.use('/api/squad-admins', squadAdminRoutes);
app.use('/api/broadcasts', broadcastRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/servers', configRoutes); // Config is a sub-resource of servers

app.get('/', (req, res) => {
  res.send('Squad Server Manager API is running');
});

// Example route to test DB connection
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error });
  }
});

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

// Initialize services with IO
rconService.setIO(io);
logService.setIO(io);

// Start services
statsService.startTracking();
broadcastService.initializeBroadcasts();

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});
