import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import rconService from '../services/rconService';
import fs from 'fs/promises';
import path from 'path';
import SftpClient from 'ssh2-sftp-client';
import { Client as FtpClient } from 'basic-ftp';
import logWatcherService from '../services/logWatcherService';

const prisma = new PrismaClient();

const normalizeFileProtocol = (protocol?: string | null) => {
  if (!protocol) {
    return null;
  }
  const normalized = protocol.trim().toLowerCase();
  if (normalized === 'none') {
    return null;
  }
  if (normalized === 'local' || normalized === 'ftp' || normalized === 'sftp') {
    return normalized;
  }
  return 'invalid';
};

const normalizeRemotePath = (rawPath?: string | null) => {
  const cleaned = (rawPath || '').trim().replace(/\\/g, '/').replace(/\/+$/, '');
  return cleaned;
};

const resolveFileConnectionError = (error: any) => {
  const code = typeof error?.code === 'string' ? error.code : '';
  const message = typeof error?.message === 'string' ? error.message : '';
  if (['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'EHOSTUNREACH', 'ENOTFOUND'].includes(code)) {
    return { status: 502, message: `文件服务连接失败（${code}）` };
  }
  if (/getaddrinfo|authentication|permission denied|login failed|timed out/i.test(message)) {
    return { status: 502, message: '文件服务连接失败，请检查主机、端口、用户名和密码' };
  }
  return { status: 500, message: message || '文件连接测试失败' };
};

export const getServers = async (req: Request, res: Response) => {
  const { name, host, rconPort } = req.query;
  const user = req.user;

  try {
    const where: any = {};
    if (name) where.name = { contains: String(name) };
    if (host) where.host = { contains: String(host) };
    if (rconPort) where.rconPort = Number(rconPort);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (user.role !== 'superadmin') {
      const permissionRows = await prisma.serverPermission.findMany({
        where: { userId: user.id },
        select: { serverId: true }
      });
      const allowedServerIds = permissionRows.map((item) => item.serverId);
      if (allowedServerIds.length === 0) {
        return res.json([]);
      }
      where.id = { in: allowedServerIds };
    }

    const servers = await prisma.server.findMany({
      where
    });
    const serversWithStatus = await Promise.all(servers.map(async (server) => {
      const status = server.isPublished ? rconService.getConnectionStatus(server.id) : 'unpublished';
      
      // 如果是已发布且连接中，尝试获取实时数据
      let currentMap = null;
      let playerCount = null;
      let maxPlayers = null;
      
      if (status === 'connected') {
        try {
          const gameState = await rconService.getGameState(server.id);
          if (gameState) {
            currentMap = gameState.currentMap || gameState.currentMapName;
            playerCount = gameState.playerCount;
            maxPlayers = gameState.maxPlayers;
          }
        } catch (error) {
          console.warn(`Failed to get game state for server ${server.name}:`, error);
        }
      }
      
      return {
        ...server,
        rconStatus: status,
        currentMap,
        playerCount,
        maxPlayers
      };
    }));
    
    res.json(serversWithStatus);
  } catch (error: any) {
    res.status(500).json({ message: error?.message || 'Error fetching servers' });
  }
};

export const addServer = async (req: Request, res: Response) => {
  const { 
    name, 
    host, 
    rconPort, 
    rconPassword, 
    queryPort,
    fileProtocol,
    fileHost,
    filePort,
    fileUser,
    filePassword,
    filePath,
    isPublished
  } = req.body;

  try {
    const server = await prisma.server.create({
      data: {
        name,
        host,
        rconPort: parseInt(rconPort),
        rconPassword,
        queryPort: queryPort ? parseInt(queryPort) : null,
        fileProtocol,
        fileHost,
        filePort: filePort ? parseInt(filePort) : null,
        fileUser,
        filePassword,
        filePath,
        isPublished: isPublished !== undefined ? isPublished : true
      }
    });

    // Try to connect RCON immediately (will check isPublished internally)
    rconService.connect(server.id);

    res.status(201).json(server);
  } catch (error: any) {
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (Array.isArray(target) && target.includes('host') && target.includes('rconPort')) {
        return res.status(409).json({ message: 'Server with this Host and RCON Port already exists' });
      }
    }
    res.status(500).json({ message: 'Error adding server' });
  }
};

export const updateServer = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { 
    name, 
    host, 
    rconPort, 
    rconPassword, 
    queryPort,
    fileProtocol,
    fileHost,
    filePort,
    fileUser,
    filePassword,
    filePath,
    isPublished
  } = req.body;

  try {
    const server = await prisma.server.update({
      where: { id },
      data: {
        name,
        host,
        rconPort: parseInt(rconPort),
        rconPassword,
        queryPort: queryPort ? parseInt(queryPort) : null,
        fileProtocol,
        fileHost,
        filePort: filePort ? parseInt(filePort) : null,
        fileUser,
        filePassword,
        filePath,
        isPublished: isPublished !== undefined ? isPublished : undefined
      }
    });
    
    // Reconnect or disconnect based on new config
    await rconService.disconnect(id);
    rconService.connect(id);

    res.json(server);
  } catch (error: any) {
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (Array.isArray(target) && target.includes('host') && target.includes('rconPort')) {
        return res.status(409).json({ message: 'Server with this Host and RCON Port already exists' });
      }
    }
    res.status(500).json({ message: 'Error updating server' });
  }
};

export const deleteServer = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  try {
    logWatcherService.stop(id);
    try {
      await rconService.disconnect(id);
    } catch (disconnectError) {
      console.warn(`RCON disconnect warning for server ${id}:`, disconnectError);
    }
    
    await prisma.$transaction([
      prisma.log.deleteMany({ where: { serverId: id } }),
      prisma.adminAttendance.deleteMany({ where: { serverId: id } }),
      prisma.whitelist.deleteMany({ where: { serverId: id } }),
      prisma.serverPermission.deleteMany({ where: { serverId: id } }),
      prisma.broadcast.deleteMany({ where: { serverId: id } }),
      prisma.serverMetric.deleteMany({ where: { serverId: id } }),
      prisma.logState.deleteMany({ where: { serverId: id } }),
      prisma.notificationLog.deleteMany({ 
        where: { rule: { serverId: id } } 
      }),
      prisma.notificationRule.deleteMany({ where: { serverId: id } }),
      prisma.scheduledTask.deleteMany({ where: { serverId: id } }),
      prisma.gameEvent.deleteMany({ where: { serverId: id } }),
      prisma.match.deleteMany({ where: { serverId: id } }),
      prisma.scrimMatch.updateMany({ 
        where: { serverId: id },
        data: { serverId: null }
      }),
      prisma.server.delete({ where: { id } })
    ]);

    res.json({ message: 'Server deleted' });
  } catch (error: any) {
    console.error('Delete server error:', error);
    if (error?.code === 'P2003') {
      return res.status(409).json({ message: '服务器仍有关联数据写入，请稍后重试删除' });
    }
    if (error?.code === 'P2025') {
      return res.status(404).json({ message: '服务器不存在或已删除' });
    }
    res.status(500).json({ message: error?.message || 'Error deleting server' });
  }
};

export const executeRconCommand = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { command } = req.body;

  try {
    const response = await rconService.execute(id as string, command);
    res.json({ response });
  } catch (error: any) {
    res.status(500).json({ message: 'RCON Error', error: error.message });
  }
};

export const disbandSquad = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { teamId, squadIndex } = req.body;

  if (!teamId || !squadIndex) {
    return res.status(400).json({ message: 'Missing teamId or squadIndex' });
  }

  try {
    // Command: AdminDisbandSquad <TeamNumber> <SquadIndex>
    const command = `AdminDisbandSquad ${teamId} ${squadIndex}`;
    const response = await rconService.execute(id as string, command);
    res.json({ message: `Squad ${squadIndex} on Team ${teamId} disbanded`, response });
  } catch (error: any) {
    res.status(500).json({ message: 'Error disbanding squad', error: error.message });
  }
};

export const getServerMetrics = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { range } = req.query; // e.g. '24h', '7d'

  let fromDate = new Date();
  if (range === '7d') {
    fromDate.setDate(fromDate.getDate() - 7);
  } else {
    // Default 24h
    fromDate.setHours(fromDate.getHours() - 24);
  }

  try {
    const metrics = await prisma.serverMetric.findMany({
      where: {
        serverId: id,
        timestamp: {
          gte: fromDate
        }
      },
      orderBy: {
        timestamp: 'asc'
      },
      select: {
        timestamp: true,
        playerCount: true,
        maxPlayers: true,
        tps: true
      }
    });
    res.json(metrics);
  } catch (error: any) {
    res.status(500).json({ message: error?.message || 'Error fetching metrics' });
  }
};

export const getServerStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const state = await rconService.getGameState(id as string);
    if (!state) {
      return res.status(404).json({ message: 'Failed to get server state' });
    }
    res.json(state);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching server status', error: error.message });
  }
};

export const testRconConnection = async (req: Request, res: Response) => {
  const serverId = req.params.id as string;
  try {
    const server = await prisma.server.findUnique({ where: { id: serverId } });
    if (!server) {
      return res.status(404).json({ status: 'error', message: '服务器未找到' });
    }

    // 获取当前 RCON 连接状态
    const currentStatus = rconService.getConnectionStatus(serverId);
    
    let result = {
      status: currentStatus,
      serverName: server.name,
      host: server.host,
      rconPort: server.rconPort,
      message: '',
      latency: null as number | null,
      serverInfo: null as any
    };

    if (currentStatus === 'connected') {
      // 如果已连接，测试执行命令
      const startTime = Date.now();
      try {
        const response = await rconService.execute(serverId, 'ShowServerInfo');
        result.latency = Date.now() - startTime;
        result.message = 'RCON 连接成功';
        
        try {
          result.serverInfo = JSON.parse(response);
        } catch (e) {
          // 解析失败不影响结果
        }
      } catch (error: any) {
        result.status = 'disconnected';
        result.message = `执行命令失败: ${error.message}`;
      }
    } else if (currentStatus === 'connecting') {
      result.status = 'connecting';
      result.message = 'RCON 正在连接中...';
    } else {
      result.status = 'disconnected';
      result.message = 'RCON 未连接';
    }

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: '测试失败', error: error.message });
  }
};

export const testFileConnection = async (req: Request, res: Response) => {
  const protocol = normalizeFileProtocol(req.body?.fileProtocol);
  const targetHost = (req.body?.fileHost || req.body?.host || '').trim();
  const filePath = (req.body?.filePath || '').trim();
  const fileUser = req.body?.fileUser || '';
  const filePassword = req.body?.filePassword || '';
  const filePort = req.body?.filePort ? Number(req.body.filePort) : undefined;

  if (protocol === null) {
    return res.status(400).json({ message: '请先选择文件访问协议' });
  }
  if (protocol === 'invalid') {
    return res.status(400).json({ message: '不支持的文件访问协议' });
  }
  if (!filePath) {
    return res.status(400).json({ message: '请填写配置目录路径' });
  }

  try {
    if (protocol === 'local') {
      const fullPath = path.resolve(filePath);
      await fs.access(fullPath);
      return res.json({ message: '本地目录连接成功' });
    }

    if (!targetHost) {
      return res.status(400).json({ message: '请填写文件主机或服务器主机 IP' });
    }

    if (protocol === 'sftp') {
      const sftp = new SftpClient();
      try {
        await sftp.connect({
          host: targetHost,
          port: filePort || 22,
          username: fileUser,
          password: filePassword
        });
        const remotePath = normalizeRemotePath(filePath);
        const existsType = await sftp.exists(remotePath);
        if (!existsType) {
          return res.status(400).json({ message: '远程目录不存在，请检查配置目录路径' });
        }
        return res.json({ message: 'SFTP 连接成功，目录可访问' });
      } finally {
        if ((sftp as any).sftp) {
          await sftp.end();
        }
      }
    }

    if (protocol === 'ftp') {
      const client = new FtpClient();
      try {
        await client.access({
          host: targetHost,
          port: filePort || 21,
          user: fileUser,
          password: filePassword,
          secure: false
        });
        const remotePath = normalizeRemotePath(filePath);
        await client.cd(remotePath);
        return res.json({ message: 'FTP 连接成功，目录可访问' });
      } finally {
        client.close();
      }
    }

    return res.status(400).json({ message: '不支持的文件访问协议' });
  } catch (error: any) {
    const resolved = resolveFileConnectionError(error);
    return res.status(resolved.status).json({ message: resolved.message });
  }
};

export const bulkAction = async (req: Request, res: Response) => {
  const { serverIds, action, payload } = req.body;
  const user = req.user;

  if (!Array.isArray(serverIds) || serverIds.length === 0) {
    return res.status(400).json({ message: 'No servers selected' });
  }

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const results: any[] = [];

  // Fetch user permissions if not superadmin
  let userPermissions: any[] = [];
  if (user.role !== 'superadmin') {
    userPermissions = await prisma.serverPermission.findMany({
      where: { userId: user.id }
    });
  }

  for (const id of serverIds) {
    // Permission Check
    if (user.role !== 'superadmin') {
      const perm = userPermissions.find(p => p.serverId === id);
      if (!perm) {
        results.push({ id, status: 'error', message: 'No permission' });
        continue;
      }
      const pList = JSON.parse(perm.permissions);
      // 'console' for RCON commands, 'control' for broadcast? Let's require 'console' for generic RCON
      if (!pList.includes('all') && !pList.includes('console')) {
        results.push({ id, status: 'error', message: 'Missing console permission' });
        continue;
      }
    }

    try {
      if (action === 'broadcast') {
        const command = `AdminBroadcast ${payload}`;
        const response = await rconService.execute(id, command);
        results.push({ id, status: 'success', response });
      } else if (action === 'command') {
        const response = await rconService.execute(id, payload);
        results.push({ id, status: 'success', response });
      } else {
        results.push({ id, status: 'error', message: 'Unknown action' });
      }
    } catch (error: any) {
      results.push({ id, status: 'error', message: error.message });
    }
  }

  res.json({ results });
};
