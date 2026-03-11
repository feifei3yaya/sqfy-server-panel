const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const compression = require('compression');

const app = express();

// 启用 Gzip 压缩
app.use(compression({
  level: 6, // 压缩级别（1-9，6是平衡点）
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// CORS 配置 - 支持域名访问
app.use(cors({
  origin: ['http://43.138.188.183', 'http://www.sq-fy.cn', 'https://www.sq-fy.cn'],
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

// 静态文件服务 - 前端构建目录（启用缓存和压缩）
const staticPath = path.join(__dirname, '../client/dist');
app.use(express.static(staticPath, {
  maxAge: '7d', // 缓存7天
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // 图片文件缓存30天
    if (path.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=2592000');
    }
    // JS/CSS文件缓存7天
    if (path.match(/\.(js|css)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=604800');
    }
  }
}));

// 根路由返回 index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const server = http.createServer(app);
const io = new Server(server, { 
  cors: { 
    origin: ['http://43.138.188.183', 'http://www.sq-fy.cn', 'https://www.sq-fy.cn'],
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
