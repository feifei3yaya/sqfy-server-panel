/**
 * 服务器状态监控服务
 * 实时监控服务器状态并通过 WebSocket 推送
 */

import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import { Server as SocketIOServer } from 'socket.io';

const execAsync = promisify(exec);

// 数据结构定义
export interface SystemStats {
  hostname: string;
  platform: string;
  arch: string;
  uptime: number;
  loadavg: number[];
  cpu: CPUStats;
  memory: MemoryStats;
  disk: DiskStats;
  network: NetworkStats;
  processes: ProcessStats;
  health: HealthStats;
  timestamp: Date;
}

export interface CPUStats {
  cores: number;
  model: string;
  speed: number;
  usage: number;
  temperature?: number;
}

export interface MemoryStats {
  total: number;
  free: number;
  used: number;
  usage: number;
}

export interface DiskStats {
  total: number;
  free: number;
  used: number;
  usage: number;
  mounts: DiskMount[];
}

export interface DiskMount {
  device: string;
  mountpoint: string;
  total: number;
  free: number;
  used: number;
  usage: number;
}

export interface NetworkStats {
  interfaces: NetworkInterface[];
  totalRx: number;
  totalTx: number;
}

export interface NetworkInterface {
  name: string;
  ip4?: string;
  mac: string;
  rxBytes: number;
  txBytes: number;
  state: 'up' | 'down';
}

export interface ProcessStats {
  total: number;
  running: number;
  topProcesses: ProcessInfo[];
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  user: string;
}

export interface HealthStats {
  status: 'healthy' | 'warning' | 'critical';
  score: number;
  issues: HealthIssue[];
}

export interface HealthIssue {
  type: string;
  severity: 'warning' | 'critical';
  message: string;
  value?: number;
}

class SystemMonitorService {
  private io: SocketIOServer | null = null;
  private monitorInterval: NodeJS.Timeout | null = null;
  private readonly MONITOR_INTERVAL = 5000; // 5秒
  
  // 缓存
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 2000; // 2秒

  public setIO(io: SocketIOServer) {
    this.io = io;
    console.log('SystemMonitorService: Socket.IO 已设置');
  }

  public start() {
    if (this.monitorInterval) {
      console.log('SystemMonitorService: 监控已在运行');
      return;
    }

    console.log('SystemMonitorService: 启动系统监控...');
    
    // 立即执行一次
    this.collectAndBroadcast();
    
    // 设置定时任务
    this.monitorInterval = setInterval(() => {
      this.collectAndBroadcast();
    }, this.MONITOR_INTERVAL);
  }

  public stop() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
      console.log('SystemMonitorService: 监控已停止');
    }
  }

  private async collectAndBroadcast() {
    try {
      const stats = await this.getSystemStats();
      
      // 通过 WebSocket 推送
      if (this.io) {
        this.io.emit('systemStatsUpdate', stats);
      }
    } catch (error) {
      console.error('SystemMonitorService: 采集数据失败:', error);
    }
  }

  async getSystemStats(): Promise<SystemStats> {
    const cacheKey = 'system_stats';
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached as SystemStats;
    }

    const stats: SystemStats = {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      uptime: os.uptime(),
      loadavg: os.loadavg(),
      cpu: await this.getCPUStats(),
      memory: this.getMemoryStats(),
      disk: await this.getDiskStats(),
      network: await this.getNetworkStats(),
      processes: await this.getProcessStats(),
      health: this.getHealthStats(),
      timestamp: new Date()
    };

    this.setToCache(cacheKey, stats);
    return stats;
  }

  async getCPUStats(): Promise<CPUStats> {
    const cpus = os.cpus();
    let usage = 0;
    
    // 计算 CPU 使用率
    let totalIdle = 0;
    let totalTick = 0;
    for (const cpu of cpus) {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    }
    usage = 100 - (100 * totalIdle / totalTick);

    return {
      cores: cpus.length,
      model: cpus[0].model,
      speed: cpus[0].speed,
      usage: Math.round(usage * 100) / 100
    };
  }

  getMemoryStats(): MemoryStats {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const usage = (used / total) * 100;

    return {
      total,
      free,
      used,
      usage: Math.round(usage * 100) / 100
    };
  }

  async getDiskStats(): Promise<DiskStats> {
    const mounts: DiskMount[] = [];
    
    if (os.platform() === 'linux') {
      try {
        const { stdout } = await execAsync('df -T --output=source,target,fstype,size,used,avail,pcent | tail -n +2');
        const lines = stdout.trim().split('\n');
        
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 7) {
            const [device, mountpoint, fstype, size, used, avail, pcent] = parts;
            if (device.startsWith('/dev/') && !device.includes('loop')) {
              mounts.push({
                device,
                mountpoint,
                total: parseInt(size) * 1024,
                used: parseInt(used) * 1024,
                free: parseInt(avail) * 1024,
                usage: parseFloat(pcent)
              });
            }
          }
        }
      } catch (error) {
        // 忽略
      }
    }

    const total = mounts.reduce((sum, m) => sum + m.total, 0);
    const used = mounts.reduce((sum, m) => sum + m.used, 0);
    const free = mounts.reduce((sum, m) => sum + m.free, 0);
    const usage = total > 0 ? (used / total) * 100 : 0;

    return { total, free, used, usage: Math.round(usage * 100) / 100, mounts };
  }

  async getNetworkStats(): Promise<NetworkStats> {
    const interfaces: NetworkInterface[] = [];
    const nets = os.networkInterfaces();
    
    let totalRx = 0;
    let totalTx = 0;

    for (const [name, addrs] of Object.entries(nets)) {
      if (!addrs) continue;
      
      const info: NetworkInterface = {
        name,
        mac: addrs[0]?.mac || '00:00:00:00:00:00',
        rxBytes: 0,
        txBytes: 0,
        state: 'down'
      };

      for (const addr of addrs) {
        if (addr.family === 'IPv4') {
          info.ip4 = addr.address;
        }
      }

      if (os.platform() === 'linux') {
        try {
          const rxPath = `/sys/class/net/${name}/statistics/rx_bytes`;
          const txPath = `/sys/class/net/${name}/statistics/tx_bytes`;
          const statePath = `/sys/class/net/${name}/operstate`;
          
          if (fs.existsSync(rxPath)) {
            info.rxBytes = parseInt(fs.readFileSync(rxPath, 'utf-8'));
            info.txBytes = parseInt(fs.readFileSync(txPath, 'utf-8'));
            info.state = fs.existsSync(statePath) && fs.readFileSync(statePath, 'utf-8').trim() === 'up' ? 'up' : 'down';
          }
        } catch (error) {
          // 忽略
        }
      }

      totalRx += info.rxBytes;
      totalTx += info.txBytes;
      interfaces.push(info);
    }

    return { interfaces, totalRx, totalTx };
  }

  async getProcessStats(): Promise<ProcessStats> {
    const topProcesses: ProcessInfo[] = [];

    if (os.platform() === 'linux') {
      try {
        const { stdout } = await execAsync('ps aux --sort=-%cpu | head -n 11 | tail -n 10');
        const lines = stdout.trim().split('\n');
        
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 11) {
            topProcesses.push({
              pid: parseInt(parts[1]),
              name: parts[10].split('/').pop() || parts[10],
              cpu: parseFloat(parts[2]),
              memory: parseFloat(parts[3]),
              user: parts[0]
            });
          }
        }
      } catch (error) {
        // 忽略
      }
    }

    let total = 0;
    let running = 0;

    if (os.platform() === 'linux') {
      try {
        const { stdout } = await execAsync('ps -eo stat | sort | uniq -c');
        const lines = stdout.trim().split('\n');
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          const count = parseInt(parts[0]);
          total += count;
          if (parts[1]?.startsWith('R')) running += count;
        }
      } catch (error) {
        // 忽略
      }
    }

    return { total, running, topProcesses };
  }

  getHealthStats(): HealthStats {
    const issues: HealthIssue[] = [];
    let score = 100;

    // CPU 检查
    const cpuUsage = this.getCachedCPUUsage();
    if (cpuUsage > 90) {
      issues.push({ type: 'cpu', severity: 'critical', message: 'CPU 使用率过高', value: cpuUsage });
      score -= 30;
    } else if (cpuUsage > 70) {
      issues.push({ type: 'cpu', severity: 'warning', message: 'CPU 使用率较高', value: cpuUsage });
      score -= 15;
    }

    // 内存检查
    const memStats = this.getMemoryStats();
    if (memStats.usage > 90) {
      issues.push({ type: 'memory', severity: 'critical', message: '内存使用率过高', value: memStats.usage });
      score -= 30;
    } else if (memStats.usage > 70) {
      issues.push({ type: 'memory', severity: 'warning', message: '内存使用率较高', value: memStats.usage });
      score -= 15;
    }

    // 磁盘检查
    const diskStats = this.getCachedDiskStats();
    if (diskStats.usage > 90) {
      issues.push({ type: 'disk', severity: 'critical', message: '磁盘空间不足', value: diskStats.usage });
      score -= 30;
    } else if (diskStats.usage > 70) {
      issues.push({ type: 'disk', severity: 'warning', message: '磁盘空间较少', value: diskStats.usage });
      score -= 15;
    }

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (score < 50) status = 'critical';
    else if (score < 80) status = 'warning';

    return { status, score: Math.max(0, score), issues };
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setToCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private getCachedCPUUsage(): number {
    const cached = this.getFromCache('cpu_stats');
    return cached?.usage || 0;
  }

  private getCachedDiskStats(): { total: number; free: number; used: number; usage: number } {
    const cached = this.getFromCache('disk_stats');
    return cached || { total: 0, free: 0, used: 0, usage: 0 };
  }
}

export default new SystemMonitorService();
