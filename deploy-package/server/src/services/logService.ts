import { PrismaClient } from '@prisma/client';
import { Server as SocketIOServer } from 'socket.io';

const prisma = new PrismaClient();

class LogService {
  private io: SocketIOServer | null = null;

  setIO(io: SocketIOServer) {
    this.io = io;
  }

  // 处理从 RCON 或其他来源接收到的日志
  async processLog(serverId: string, message: string) {
    const logType = this.determineLogType(message);
    
    // 存储到数据库
    const log = await prisma.log.create({
      data: {
        serverId,
        content: message,
        type: logType,
        timestamp: new Date()
      }
    });

    // 实时推送
    this.io?.to(`server:${serverId}`).emit('log', log);
  }

  private determineLogType(message: string): string {
    if (message.includes('Chat')) return 'chat';
    if (message.includes('died') || message.includes('killed')) return 'kill';
    if (message.includes('joined')) return 'join';
    if (message.includes('left')) return 'leave';
    if (message.includes('Error')) return 'error';
    if (message.includes('Warning')) return 'warning';
    return 'info';
  }
}

export default new LogService();
