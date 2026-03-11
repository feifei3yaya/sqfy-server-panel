import { PrismaClient, Broadcast } from '@prisma/client';
import rconService from './rconService';

const prisma = new PrismaClient();

class BroadcastService {
  private timers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeBroadcasts();
  }

  // Initialize all active broadcasts on startup
  async initializeBroadcasts() {
    console.log('Initializing broadcast service...');
    const broadcasts = await prisma.broadcast.findMany({
      where: { enabled: true }
    });

    for (const broadcast of broadcasts) {
      this.scheduleBroadcast(broadcast);
    }
  }

  // Schedule a single broadcast
  scheduleBroadcast(broadcast: Broadcast) {
    // Clear existing timer if any
    this.stopBroadcast(broadcast.id);

    if (!broadcast.enabled) return;

    const intervalMs = broadcast.interval * 1000;
    
    // Initial run logic or immediate start could be added here
    // For now, simple interval
    const timer = setInterval(async () => {
      try {
        await this.runBroadcast(broadcast);
      } catch (error) {
        console.error(`Failed to run broadcast ${broadcast.id}:`, error);
      }
    }, intervalMs);

    this.timers.set(broadcast.id, timer);
    console.log(`Scheduled broadcast ${broadcast.id} every ${broadcast.interval}s for server ${broadcast.serverId}`);
  }

  // Stop a broadcast timer
  stopBroadcast(broadcastId: string) {
    const timer = this.timers.get(broadcastId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(broadcastId);
      console.log(`Stopped broadcast ${broadcastId}`);
    }
  }

  // Execute the broadcast
  async runBroadcast(broadcast: Broadcast) {
    try {
      // Execute RCON command
      // Squad RCON command: AdminBroadcast <Message>
      // Using rconService.execute with a safe default if service not connected
      if (!rconService) {
        console.warn('RCON service not available');
        return;
      }
      
      await rconService.execute(broadcast.serverId, `AdminBroadcast ${broadcast.content}`);
      
      // Update last run time
      // We use a fresh prisma instance for updates to avoid closure issues
      const prisma = new PrismaClient();
      await prisma.broadcast.update({
        where: { id: broadcast.id },
        data: { lastRun: new Date() }
      });
      
      console.log(`Executed broadcast ${broadcast.id} on server ${broadcast.serverId}`);
    } catch (error) {
      // If server is offline or RCON fails, just log it
      console.warn(`Broadcast execution failed for ${broadcast.id}: ${(error as Error).message}`);
    }
  }

  // CRUD Helpers that also manage timers
  async createBroadcast(data: { serverId: string; content: string; interval: number; enabled: boolean }) {
    const broadcast = await prisma.broadcast.create({ data });
    this.scheduleBroadcast(broadcast);
    return broadcast;
  }

  async updateBroadcast(id: string, data: { content?: string; interval?: number; enabled?: boolean }) {
    const broadcast = await prisma.broadcast.update({
      where: { id },
      data
    });
    
    // Reschedule with new settings
    this.scheduleBroadcast(broadcast);
    return broadcast;
  }

  async deleteBroadcast(id: string) {
    this.stopBroadcast(id);
    await prisma.broadcast.delete({ where: { id } });
  }

  async getBroadcasts(serverId: string) {
    return prisma.broadcast.findMany({
      where: { serverId },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export default new BroadcastService();
