import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import Client from 'ssh2-sftp-client';

const prisma = new PrismaClient();

// Helper to get file content
const getFileContent = async (server: any, filename: string) => {
  if (server.fileProtocol === 'local') {
    if (!server.filePath) throw new Error('File path not configured');
    const fullPath = path.join(server.filePath, filename);
    return await fs.readFile(fullPath, 'utf-8');
  } else if (server.fileProtocol === 'sftp') {
    const sftp = new Client();
    try {
      await sftp.connect({
        host: server.fileHost,
        port: server.filePort || 22,
        username: server.fileUser,
        password: server.filePassword
      });
      if (!server.filePath) throw new Error('File path not configured');
      const fullPath = path.posix.join(server.filePath, filename); // SFTP usually uses posix paths
      const content = await sftp.get(fullPath);
      return content.toString();
    } finally {
      await sftp.end();
    }
  } else {
    throw new Error('Unsupported file protocol');
  }
};

// Helper to save file content
const saveFileContent = async (server: any, filename: string, content: string) => {
  if (server.fileProtocol === 'local') {
    if (!server.filePath) throw new Error('File path not configured');
    const fullPath = path.join(server.filePath, filename);
    // Create backup first? Maybe later.
    await fs.writeFile(fullPath, content, 'utf-8');
  } else if (server.fileProtocol === 'sftp') {
    const sftp = new Client();
    try {
      await sftp.connect({
        host: server.fileHost,
        port: server.filePort || 22,
        username: server.fileUser,
        password: server.filePassword
      });
      if (!server.filePath) throw new Error('File path not configured');
      const fullPath = path.posix.join(server.filePath, filename);
      await sftp.put(Buffer.from(content), fullPath);
    } finally {
      await sftp.end();
    }
  } else {
    throw new Error('Unsupported file protocol');
  }
};

export const getConfig = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const filename = req.params.filename as string;
  
  // Whitelist allowed files for security
  const ALLOWED_FILES = ['Server.cfg', 'Admins.cfg', 'Bans.cfg', 'License.cfg', 'Rcon.cfg', 'ExcludedFactions.cfg', 'ExcludedLayer.cfg', 'MapRotation.cfg'];
  if (!ALLOWED_FILES.includes(filename)) {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  try {
    const server = await prisma.server.findUnique({ where: { id } });
    if (!server) return res.status(404).json({ error: 'Server not found' });
    if (!server.fileProtocol) return res.status(400).json({ error: 'File access not configured for this server' });

    const content = await getFileContent(server, filename);
    res.json({ content });
  } catch (error: any) {
    console.error('Get Config Error:', error);
    res.status(500).json({ error: error.message || 'Failed to read config file' });
  }
};

export const updateConfig = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const filename = req.params.filename as string;
  const { content } = req.body;

  const ALLOWED_FILES = ['Server.cfg', 'Admins.cfg', 'Bans.cfg', 'License.cfg', 'Rcon.cfg', 'ExcludedFactions.cfg', 'ExcludedLayer.cfg', 'MapRotation.cfg'];
  if (!ALLOWED_FILES.includes(filename)) {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  try {
    const server = await prisma.server.findUnique({ where: { id } });
    if (!server) return res.status(404).json({ error: 'Server not found' });
    if (!server.fileProtocol) return res.status(400).json({ error: 'File access not configured for this server' });

    await saveFileContent(server, filename, content);
    
    // Log the action
    const userId = (req as any).user.userId;
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE_CONFIG',
        target: `${server.name} - ${filename}`
      }
    });

    res.json({ message: 'Config saved successfully' });
  } catch (error: any) {
    console.error('Save Config Error:', error);
    res.status(500).json({ error: error.message || 'Failed to save config file' });
  }
};
