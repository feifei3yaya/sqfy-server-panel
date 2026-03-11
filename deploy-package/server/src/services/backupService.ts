import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

class BackupService {
  private backupDir: string;
  private interval: NodeJS.Timeout | null = null;

  constructor() {
    this.backupDir = path.join(process.cwd(), 'backups');
    this.ensureBackupDir();
  }

  private ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  public startScheduledBackup(cronExpression: string = '0 0 * * *') {
    // For simplicity, using setInterval for hourly check or daily
    // A proper implementation would use node-schedule, but we have schedulerService for that.
    // We can register this as a task in schedulerService or just run a simple interval here.
    // Let's use a simple interval for daily backups (24h)
    
    if (this.interval) clearInterval(this.interval);
    
    console.log('Backup Service started (Daily)');
    this.interval = setInterval(() => {
      this.performBackup();
    }, 24 * 60 * 60 * 1000); 
  }

  public async performBackup() {
    const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
    const dbPath = path.join(process.cwd(), 'prisma/dev.db'); // SQLite specific
    const backupPath = path.join(this.backupDir, `backup_${timestamp}.db`);

    if (!fs.existsSync(dbPath)) {
      console.warn('Database file not found, skipping backup');
      return;
    }

    try {
      console.log(`Starting backup to ${backupPath}...`);
      // Copy file
      await fs.promises.copyFile(dbPath, backupPath);
      console.log('Backup completed successfully');
      
      // Cleanup old backups (keep last 7 days)
      await this.cleanupOldBackups();
    } catch (error) {
      console.error('Backup failed:', error);
    }
  }

  private async cleanupOldBackups() {
    try {
      const files = await fs.promises.readdir(this.backupDir);
      const now = dayjs();
      
      for (const file of files) {
        if (!file.startsWith('backup_') || !file.endsWith('.db')) continue;
        
        const filePath = path.join(this.backupDir, file);
        const stats = await fs.promises.stat(filePath);
        const fileDate = dayjs(stats.mtime);
        
        if (now.diff(fileDate, 'day') > 7) {
          await fs.promises.unlink(filePath);
          console.log(`Deleted old backup: ${file}`);
        }
      }
    } catch (error) {
      console.error('Error cleaning up old backups:', error);
    }
  }
}

export default new BackupService();
