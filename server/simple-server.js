const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 启用 Gzip 压缩
app.use(compression({
  level: 6,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// CORS 配置 - 支持域名访问
app.use(cors({
  origin: ['http://43.138.188.183', 'http://www.sq-fy.cn', 'https://www.sq-fy.cn', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json());

// 请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - ${req.headers.host}`);
  next();
});

// API 路由
app.get('/api', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Squad Panel API Running', 
    version: '1.0.0',
    time: new Date().toISOString(),
    domain: req.headers.host
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    server: 'online',
    api: 'running',
    socket: 'connected',
    domain: req.headers.host
  });
});

// 登录 API
app.post('/api/auth/login', async (req, res) => {
  const rawUsername = typeof req.body?.username === 'string' ? req.body.username : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const code = typeof req.body?.code === 'string' ? req.body.code : '';
  const identifier = rawUsername.trim();
  const normalizedEmail = identifier.toLowerCase();

  console.log(`登录尝试: username=${identifier}`);

  if (!identifier || !password) {
    return res.status(400).json({ message: '请输入用户名和密码' });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: normalizedEmail }
        ]
      }
    });

    if (!user) {
      console.log(`用户不存在: ${identifier}`);
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      console.log(`密码错误: ${identifier}`);
      await prisma.loginHistory.create({
        data: {
          userId: user.id,
          ip: req.ip || req.socket.remoteAddress || 'unknown',
          userAgent: req.get('user-agent'),
          status: 'failed'
        }
      }).catch(() => {});
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 检查 2FA
    if (user.twoFASecret) {
      if (!code.trim()) {
        return res.status(200).json({ require2FA: true });
      }

      const speakeasy = require('speakeasy');
      const verified = speakeasy.totp.verify({
        secret: user.twoFASecret,
        encoding: 'base32',
        token: code.trim(),
        window: 1
      });

      if (!verified) {
        return res.status(401).json({ message: '验证码错误' });
      }
    }

    // 记录登录成功
    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        ip: req.ip || req.socket.remoteAddress || 'unknown',
        userAgent: req.get('user-agent'),
        status: 'success'
      }
    }).catch(() => {});

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    console.log(`登录成功: ${identifier}`);
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取当前用户信息
app.get('/api/auth/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '未授权' });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        role: true,
        nickname: true,
        avatarUrl: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: '无效的令牌' });
  }
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// 静态文件服务 - 前端构建目录（启用缓存和压缩）
const staticPath = path.join(__dirname, '../client/dist');
app.use(express.static(staticPath, {
  maxAge: '7d',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=2592000');
    }
    if (path.match(/\.(js|css)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=604800');
    }
  }
}));

// 前端路由支持 - 所有非API路由都返回index.html（SPA支持）
app.use((req, res, next) => {
  if (req.url.startsWith('/api') || req.url.startsWith('/socket.io')) {
    return next();
  }
  res.sendFile(path.join(staticPath, 'index.html'));
});

const server = http.createServer(app);
const io = new Server(server, { 
  cors: { 
    origin: ['http://43.138.188.183', 'http://www.sq-fy.cn', 'https://www.sq-fy.cn', 'http://localhost:5173'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

io.on('connection', (socket) => {
  console.log('客户端已连接:', socket.id);
  
  socket.on('ping', () => {
    socket.emit('pong');
  });
  
  socket.on('disconnect', (reason) => {
    console.log('客户端已断开:', socket.id, '原因:', reason);
  });
});

const PORT = process.env.PORT || 80;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`静态文件目录: ${staticPath}`);
  console.log(`支持的域名: www.sq-fy.cn, 43.138.188.183`);
  console.log(`访问地址: http://www.sq-fy.cn`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM 信号接收，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});
