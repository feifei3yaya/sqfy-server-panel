import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import rconService from './rconService';

const prisma = new PrismaClient();

class DiscordService {
  private client: Client;
  private channelId: string | null = null;
  private isReady = false;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    });

    this.setupListeners();
  }

  private setupListeners() {
    this.client.on('ready', () => {
      console.log(`Discord Bot logged in as ${this.client.user?.tag}`);
      this.isReady = true;
    });

    this.client.on('messageCreate', async (message) => {
      // Ignore bot messages
      if (message.author.bot) return;

      // Only listen to specific channel if configured
      if (this.channelId && message.channelId !== this.channelId) return;

      // Command handling (simple)
      if (message.content.startsWith('!rcon ')) {
        // Only allow admins? For now, open to channel members
        const cmd = message.content.slice(6);
        // Execute on ALL connected servers or specify?
        // Default to all connected servers for broadcast, or need syntax !rcon <server> <cmd>
        // Let's keep it simple: Broadcast to all connected servers if it's AdminBroadcast
        
        // For now, just log received message
        console.log(`[Discord] Received: ${message.content}`);
        
        // Forward to servers as AdminBroadcast
        // "Discord User: Message"
        const broadcastMsg = `Discord [${message.author.username}]: ${message.content}`;
        // await this.broadcastToServer(broadcastMsg);
      }
    });
  }

  async connect() {
    const token = process.env.DISCORD_TOKEN;
    this.channelId = process.env.DISCORD_CHANNEL_ID || null;

    if (!token) {
      console.warn('DISCORD_TOKEN not set, skipping Discord Bot connection');
      return;
    }

    try {
      await this.client.login(token);
    } catch (error) {
      console.error('Failed to login to Discord:', error);
    }
  }

  async sendMessage(content: string) {
    if (!this.isReady || !this.channelId) return;

    try {
      const channel = await this.client.channels.fetch(this.channelId);
      if (channel && channel instanceof TextChannel) {
        await channel.send(content);
      }
    } catch (error) {
      console.error('Failed to send Discord message:', error);
    }
  }

  // Called by LogWatcher for Chat/Events
  async sendLog(serverId: string, type: string, payload: any) {
    if (!this.isReady || !this.channelId) return;

    let message = '';
    const serverName = await this.getServerName(serverId);

    switch (type) {
      case 'CHAT':
        message = `**[${serverName}]** 💬 **${payload.senderName}**: ${payload.message}`;
        break;
      case 'KILL':
        message = `**[${serverName}]** ☠️ **${payload.attackerName}** killed **${payload.victimName}** with ${payload.weapon}`;
        break;
      case 'ADMIN':
        message = `**[${serverName}]** 🛡️ **${payload.adminName}** executed: \`${payload.command}\``;
        break;
      case 'MATCH_WINNER':
        message = `**[${serverName}]** 🏆 Match Winner: **Team ${payload.winnerTeamId}**`;
        break;
      default:
        return;
    }

    await this.sendMessage(message);
  }

  private serverNameCache = new Map<string, string>();
  private async getServerName(serverId: string): Promise<string> {
    if (this.serverNameCache.has(serverId)) return this.serverNameCache.get(serverId)!;
    
    const server = await prisma.server.findUnique({ where: { id: serverId }, select: { name: true } });
    const name = server?.name || 'Unknown Server';
    this.serverNameCache.set(serverId, name);
    return name;
  }
}

export default new DiscordService();
