import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import Client from 'ssh2-sftp-client';
import * as ftp from 'basic-ftp';

const prisma = new PrismaClient();

const normalizeProtocol = (protocol?: string | null) => {
  if (!protocol) {
    return 'local';
  }
  const normalized = protocol.trim().toLowerCase();
  if (normalized === 'none') {
    return null;
  }
  if (normalized === 'local' || normalized === 'ftp' || normalized === 'sftp') {
    return normalized;
  }
  return null;
};

const createHttpError = (statusCode: number, message: string) => {
  const error = new Error(message) as Error & { statusCode?: number };
  error.statusCode = statusCode;
  return error;
};

const normalizeFileAccessError = (error: any, context?: { protocol?: string; host?: string; port?: number }) => {
  const code = typeof error?.code === 'string' ? error.code : '';
  const message = typeof error?.message === 'string' ? error.message : '';
  const isConnectionError = ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'EHOSTUNREACH', 'ENOTFOUND'].includes(code)
    || /ECONNRESET|ECONNREFUSED|ETIMEDOUT|EHOSTUNREACH|ENOTFOUND/i.test(message);
  if (isConnectionError) {
    const protocol = context?.protocol || 'unknown';
    const host = context?.host || 'unknown';
    const port = context?.port ? String(context.port) : 'default';
    const protocolHint = protocol === 'sftp'
      ? '请确认远端开启 SFTP/SSH（通常 22 端口），若仅开放 FTP 请将协议改为 FTP'
      : protocol === 'ftp'
        ? '请确认远端开启 FTP（通常 21 端口），若是 SSH/SFTP 服务请将协议改为 SFTP'
        : '请检查协议与端口是否匹配';
    return createHttpError(502, `文件服务连接失败（${code || 'NETWORK_ERROR'}，${protocol}://${host}:${port}），${protocolHint}，并检查主机、端口和账号`);
  }
  return error;
};

const toRemotePath = (basePath: string, filename: string) => {
  const normalizedBasePath = basePath.replace(/\\/g, '/').replace(/\/+$/, '');
  return normalizedBasePath ? `${normalizedBasePath}/${filename}` : filename;
};

const resolveRemoteConnection = (server: any, protocol: 'ftp' | 'sftp') => {
  const host = String(server.fileHost || server.host || '').trim();
  if (!host) {
    throw createHttpError(400, '文件主机未配置');
  }
  const username = String(server.fileUser || '').trim();
  if (!username) {
    throw createHttpError(400, `${protocol.toUpperCase()} 用户名未配置`);
  }
  const password = String(server.filePassword || '');
  if (!password) {
    throw createHttpError(400, `${protocol.toUpperCase()} 密码未配置`);
  }
  const port = Number(server.filePort) || (protocol === 'sftp' ? 22 : 21);
  return { host, username, password, port };
};

// Helper to get file content
const getFileContent = async (server: any, filename: string) => {
  const protocol = normalizeProtocol(server.fileProtocol);
  if (!protocol) {
    throw createHttpError(400, 'File access not configured for this server');
  }
  if (protocol === 'local') {
    if (!server.filePath) throw new Error('File path not configured');
    const fullPath = path.join(server.filePath, filename);
    return await fs.readFile(fullPath, 'utf-8');
  } else if (protocol === 'sftp') {
    const sftp = new Client();
    const conn = resolveRemoteConnection(server, 'sftp');
    try {
      await sftp.connect({
        host: conn.host,
        port: conn.port,
        username: conn.username,
        password: conn.password
      });
      if (!server.filePath) throw new Error('File path not configured');
      const fullPath = toRemotePath(server.filePath, filename);
      const content = await sftp.get(fullPath);
      if (Buffer.isBuffer(content)) {
        return content.toString('utf-8');
      }
      return String(content);
    } finally {
      if ((sftp as any).sftp) {
        await sftp.end();
      }
    }
  } else if (protocol === 'ftp') {
    const client = new ftp.Client();
    const conn = resolveRemoteConnection(server, 'ftp');
    try {
      await client.access({
        host: conn.host,
        port: conn.port,
        user: conn.username,
        password: conn.password,
        secure: false
      });
      if (!server.filePath) throw new Error('File path not configured');
      const fullPath = toRemotePath(server.filePath, filename);
      const chunks: Buffer[] = [];
      const writable = new (require('stream').Writable)({
        write(chunk: any, encoding: any, callback: any) {
          chunks.push(chunk);
          callback();
        }
      });
      
      await client.downloadTo(writable, fullPath);
      return Buffer.concat(chunks).toString('utf-8');
    } finally {
      client.close();
    }
  }
  throw createHttpError(400, `Unsupported file protocol: ${server.fileProtocol}`);
};

// Helper to save file content
const saveFileContent = async (server: any, filename: string, content: string) => {
  const protocol = normalizeProtocol(server.fileProtocol);
  if (!protocol) {
    throw createHttpError(400, 'File access not configured for this server');
  }
  if (protocol === 'local') {
    if (!server.filePath) throw new Error('File path not configured');
    const fullPath = path.join(server.filePath, filename);
    await fs.writeFile(fullPath, content, 'utf-8');
  } else if (protocol === 'sftp') {
    const sftp = new Client();
    const conn = resolveRemoteConnection(server, 'sftp');
    try {
      await sftp.connect({
        host: conn.host,
        port: conn.port,
        username: conn.username,
        password: conn.password
      });
      if (!server.filePath) throw new Error('File path not configured');
      const fullPath = toRemotePath(server.filePath, filename);
      await sftp.put(Buffer.from(content), fullPath);
    } finally {
      if ((sftp as any).sftp) {
        await sftp.end();
      }
    }
  } else if (protocol === 'ftp') {
    const client = new ftp.Client();
    const conn = resolveRemoteConnection(server, 'ftp');
    try {
      await client.access({
        host: conn.host,
        port: conn.port,
        user: conn.username,
        password: conn.password,
        secure: false
      });
      if (!server.filePath) throw new Error('File path not configured');
      const fullPath = toRemotePath(server.filePath, filename);
      
      const readable = require('stream').Readable.from([content]);
      await client.uploadFrom(readable, fullPath);
    } finally {
      client.close();
    }
  }
  if (protocol !== 'local' && protocol !== 'sftp' && protocol !== 'ftp') {
    throw createHttpError(400, `Unsupported file protocol: ${server.fileProtocol}`);
  }
};

export const getConfig = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const filename = req.params.filename as string;
  let server: any = null;
  
  // Whitelist allowed files for security
  const ALLOWED_FILES = [
    'Server.cfg', 
    'Admins.cfg', 
    'Bans.cfg', 
    'License.cfg', 
    'Rcon.cfg', 
    'ExcludedFactions.cfg', 
    'ExcludedLayer.cfg', 
    'MapRotation.cfg',
    'RemoteAdminListHosts.cfg',
    'ServerMessages.cfg',
    'Motd.cfg'
  ];
  if (!ALLOWED_FILES.includes(filename)) {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  try {
    server = await prisma.server.findUnique({ where: { id } });
    if (!server) return res.status(404).json({ error: 'Server not found' });
    if (!normalizeProtocol(server.fileProtocol)) return res.status(400).json({ error: 'File access not configured for this server' });

    const content = await getFileContent(server, filename);
    res.json({ content });
  } catch (error: any) {
    const normalizedError = normalizeFileAccessError(error, {
      protocol: normalizeProtocol(server?.fileProtocol) || undefined,
      host: String(server?.fileHost || server?.host || ''),
      port: Number(server?.filePort) || undefined
    });
    console.error('Get Config Error:', normalizedError);
    const statusCode = typeof normalizedError?.statusCode === 'number' ? normalizedError.statusCode : 500;
    res.status(statusCode).json({ error: normalizedError.message || 'Failed to read config file' });
  }
};

export const updateConfig = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const filename = req.params.filename as string;
  const { content } = req.body;
  let server: any = null;

  const ALLOWED_FILES = [
    'Server.cfg', 
    'Admins.cfg', 
    'Bans.cfg', 
    'License.cfg', 
    'Rcon.cfg', 
    'ExcludedFactions.cfg', 
    'ExcludedLayer.cfg', 
    'MapRotation.cfg',
    'RemoteAdminListHosts.cfg',
    'ServerMessages.cfg',
    'Motd.cfg'
  ];
  if (!ALLOWED_FILES.includes(filename)) {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  try {
    server = await prisma.server.findUnique({ where: { id } });
    if (!server) return res.status(404).json({ error: 'Server not found' });
    if (!normalizeProtocol(server.fileProtocol)) return res.status(400).json({ error: 'File access not configured for this server' });

    await saveFileContent(server, filename, content);
    
    // Log the action
    const userId = req.user?.id;
    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'UPDATE_CONFIG',
          target: `${server.name} - ${filename}`
        }
      });
    }

    res.json({ message: 'Config saved successfully' });
  } catch (error: any) {
    const normalizedError = normalizeFileAccessError(error, {
      protocol: normalizeProtocol(server?.fileProtocol) || undefined,
      host: String(server?.fileHost || server?.host || ''),
      port: Number(server?.filePort) || undefined
    });
    console.error('Save Config Error:', normalizedError);
    const statusCode = typeof normalizedError?.statusCode === 'number' ? normalizedError.statusCode : 500;
    res.status(statusCode).json({ error: normalizedError.message || 'Failed to save config file' });
  }
};
