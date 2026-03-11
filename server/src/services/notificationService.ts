import { PrismaClient, NotificationRule } from '@prisma/client';
import { smsService } from './smsService';
import discordService from './discordService';

const prisma = new PrismaClient();

interface RuleContext {
  serverId?: string;
  serverName?: string;
  playerCount?: number;
  logContent?: string;
  cpuUsage?: number;
  memoryUsage?: number;
  [key: string]: any;
}

class NotificationService {
  
  // Check rules based on type and context
  async checkRules(type: string, context: RuleContext) {
    try {
      // Find active rules for this type
      const rules = await prisma.notificationRule.findMany({
        where: {
          type,
          enabled: true,
          OR: [
            { serverId: null }, // Global rules
            { serverId: context.serverId } // Server specific rules
          ]
        },
        include: {
          server: true
        }
      });

      for (const rule of rules) {
        if (await this.shouldTrigger(rule, context)) {
          await this.triggerRule(rule, context);
        }
      }
    } catch (error) {
      console.error('Error checking notification rules:', error);
    }
  }

  private async shouldTrigger(rule: NotificationRule, context: RuleContext): Promise<boolean> {
    // Check cooldown
    if (rule.lastTriggered) {
      const now = new Date();
      const diffSeconds = (now.getTime() - rule.lastTriggered.getTime()) / 1000;
      if (diffSeconds < rule.cooldown) {
        return false;
      }
    }

    try {
      const condition = JSON.parse(rule.condition);
      
      switch (rule.type) {
        case 'player_count':
          // { "operator": ">", "value": 80 }
          if (context.playerCount === undefined) return false;
          if (condition.operator === '>' && context.playerCount > condition.value) return true;
          if (condition.operator === '<' && context.playerCount < condition.value) return true;
          if (condition.operator === '>=' && context.playerCount >= condition.value) return true;
          if (condition.operator === '<=' && context.playerCount <= condition.value) return true;
          break;

        case 'log_keyword':
          // { "keyword": "Crash" }
          if (!context.logContent) return false;
          if (context.logContent.includes(condition.keyword)) return true;
          break;
        
        case 'system_resource':
          // { "cpuThreshold": 90, "memoryThreshold": 90 }
          if (condition.cpuThreshold && context.cpuUsage !== undefined && context.cpuUsage >= condition.cpuThreshold) return true;
          if (condition.memoryThreshold && context.memoryUsage !== undefined && context.memoryUsage >= condition.memoryThreshold) return true;
          break;

        case 'server_down':
          // Simple trigger if type matches
          return true;

        default:
          return false;
      }
    } catch (e) {
      console.error(`Error parsing condition for rule ${rule.id}:`, e);
      return false;
    }

    return false;
  }

  private async triggerRule(rule: NotificationRule, context: RuleContext) {
    try {
      const targets = JSON.parse(rule.targets) as string[];
      const channels = JSON.parse(rule.channels) as string[];
      
      // Update lastTriggered immediately to prevent race conditions (though simple await is fine here)
      await prisma.notificationRule.update({
        where: { id: rule.id },
        data: { lastTriggered: new Date() }
      });

      const message = this.formatMessage(rule, context);

      for (const channel of channels) {
        if (channel === 'sms') {
          for (const target of targets) {
            // Send SMS
            await smsService.sendSms({
              phoneNumber: target,
              templateParams: [message],
            });
            
            await prisma.notificationLog.create({
              data: {
                ruleId: rule.id,
                type: 'sms',
                target,
                content: message,
                status: 'success'
              }
            });
          }
        } else if (channel === 'discord') {
          // Send to Discord
          await discordService.sendMessage(message);
          
          await prisma.notificationLog.create({
            data: {
              ruleId: rule.id,
              type: 'discord',
              target: 'channel',
              content: message,
              status: 'success'
            }
          });
        }
      }
    } catch (error: any) {
      console.error(`Error triggering rule ${rule.id}:`, error);
      await prisma.notificationLog.create({
        data: {
          ruleId: rule.id,
          type: 'error',
          target: 'system',
          content: error.message || 'Unknown error',
          status: 'failed'
        }
      });
    }
  }

  private formatMessage(rule: NotificationRule, context: RuleContext): string {
    const serverName = context.serverName || (rule as any).server?.name || 'Server';
    
    switch (rule.type) {
      case 'player_count':
        return `[${serverName}] 玩家数告警: 当前人数 ${context.playerCount}`;
      case 'server_down':
        return `[${serverName}] 服务器离线告警!`;
      case 'log_keyword':
        return `[${serverName}] 日志告警: 发现关键词`;
      case 'system_resource':
        let msg = `[${serverName}] 系统资源告警:`;
        if (context.cpuUsage !== undefined) msg += ` CPU ${context.cpuUsage.toFixed(1)}%`;
        if (context.memoryUsage !== undefined) msg += ` MEM ${context.memoryUsage.toFixed(1)}%`;
        return msg;
      default:
        return `[${serverName}] ${rule.name} 触发`;
    }
  }
}

export const notificationService = new NotificationService();
