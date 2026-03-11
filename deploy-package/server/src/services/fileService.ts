import fs from 'fs/promises';
import path from 'path';
import { Client as FtpClient } from 'basic-ftp';
import SftpClient from 'ssh2-sftp-client';
import { Server } from '@prisma/client';

class FileService {
  async writeFile(server: Server, fileName: string, content: string): Promise<void> {
    if (!server.fileProtocol || server.fileProtocol === 'local') {
      await this.writeLocalFile(server, fileName, content);
    } else if (server.fileProtocol === 'ftp') {
      await this.writeFtpFile(server, fileName, content);
    } else if (server.fileProtocol === 'sftp') {
      await this.writeSftpFile(server, fileName, content);
    } else {
      throw new Error(`Unsupported file protocol: ${server.fileProtocol}`);
    }
  }

  private async writeLocalFile(server: Server, fileName: string, content: string): Promise<void> {
    if (!server.filePath) throw new Error('File path not configured');
    await fs.mkdir(server.filePath, { recursive: true });
    const fullPath = path.join(server.filePath, fileName);
    await fs.writeFile(fullPath, content, 'utf-8');
  }

  private async writeFtpFile(server: Server, fileName: string, content: string): Promise<void> {
    const client = new FtpClient();
    try {
      await client.access({
        host: server.fileHost || server.host,
        port: server.filePort || 21,
        user: server.fileUser || '',
        password: server.filePassword || '',
        secure: false
      });
      
      const remotePath = server.filePath ? path.posix.join(server.filePath, fileName) : fileName;
      
      // Create a temporary stream from string
      const { Readable } = await import('stream');
      const stream = Readable.from([content]);
      
      await client.uploadFrom(stream, remotePath);
    } finally {
      client.close();
    }
  }

  private async writeSftpFile(server: Server, fileName: string, content: string): Promise<void> {
    const sftp = new SftpClient();
    try {
      await sftp.connect({
        host: server.fileHost || server.host,
        port: server.filePort || 22,
        username: server.fileUser || '',
        password: server.filePassword || ''
      });

      const remotePath = server.filePath ? path.posix.join(server.filePath, fileName) : fileName;
      await sftp.put(Buffer.from(content), remotePath);
    } finally {
      await sftp.end();
    }
  }
}

export default new FileService();
