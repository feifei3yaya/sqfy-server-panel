import { PrismaClient, ScheduledTask } from '@prisma/client';
import * as schedule from 'node-schedule';
import rconService from './rconService';

const prisma = new PrismaClient();

class SchedulerService {
  private jobs: Map<string, schedule.Job> = new Map();
  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  private async writeExecutionLog(task: ScheduledTask, status: 'success' | 'failed', attempt: number, totalAttempts: number, durationMs: number, error?: string) {
    await prisma.systemLog.create({
      data: {
        level: status === 'success' ? 'info' : 'error',
        category: 'scheduler',
        source: 'schedulerService',
        message: status === 'success' ? `Task executed: ${task.name}` : `Task failed: ${task.name}`,
        metadata: JSON.stringify({
          taskId: task.id,
          taskName: task.name,
          taskType: task.type,
          attempt,
          totalAttempts,
          durationMs,
          error: error || null
        }),
        timestamp: new Date()
      }
    });
  }

  async initialize() {
    console.log('Initializing Scheduler Service...');
    const tasks = await prisma.scheduledTask.findMany({
      where: { enabled: true }
    });

    for (const task of tasks) {
      this.scheduleJob(task);
    }
    console.log(`Loaded ${tasks.length} scheduled tasks.`);
  }

  scheduleJob(task: ScheduledTask) {
    // Cancel existing job if any
    if (this.jobs.has(task.id)) {
      this.jobs.get(task.id)?.cancel();
    }

    if (!task.enabled || !task.cron) return;

    try {
      const job = schedule.scheduleJob(task.cron, async () => {
        console.log(`Executing scheduled task: ${task.name || task.id} (${task.type})`);
        await this.runTaskWithHistory(task, job.nextInvocation());
      });

      this.jobs.set(task.id, job);
      
      // Update next run time in DB
      prisma.scheduledTask.update({
        where: { id: task.id },
        data: { nextRun: job.nextInvocation() }
      }).catch(console.error);

    } catch (error) {
      console.error(`Failed to schedule task ${task.id}:`, error);
    }
  }

  async executeTask(task: ScheduledTask) {
    switch (task.type) {
      case 'rcon_command':
        if (task.payload) {
          return await rconService.execute(task.serverId, task.payload);
        }
        return null;
      
      case 'broadcast':
        if (task.payload) {
          return await rconService.execute(task.serverId, `AdminBroadcast ${task.payload}`);
        }
        return null;

      case 'restart':
        return await rconService.execute(task.serverId, 'AdminEndMatch');

      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  async runTaskNow(taskId: string) {
    const task = await prisma.scheduledTask.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new Error('Task not found');
    }
    await this.runTaskWithHistory(task);
  }

  private async runTaskWithHistory(task: ScheduledTask, nextRun?: Date | null) {
    const retryCount = task.retryCount || 0;
    const retryDelay = task.retryDelay || 30;
    const totalAttempts = retryCount + 1;
    let lastError: any = null;
    for (let attempt = 0; attempt <= retryCount; attempt++) {
      const startedAt = new Date();
      try {
        const output = await this.executeTask(task);
        const finishedAt = new Date();
        const durationMs = finishedAt.getTime() - startedAt.getTime();
        const outputText = typeof output === 'string' ? output : output ? JSON.stringify(output) : null;
        await prisma.scheduledTaskExecution.create({
          data: {
            taskId: task.id,
            status: 'success',
            attempt: attempt + 1,
            totalAttempts,
            startedAt,
            finishedAt,
            durationMs,
            output: outputText
          }
        });
        await this.writeExecutionLog(task, 'success', attempt + 1, totalAttempts, durationMs);
        await prisma.scheduledTask.update({
          where: { id: task.id },
          data: {
            lastRun: finishedAt,
            nextRun: nextRun === undefined ? undefined : nextRun
          }
        });
        return;
      } catch (error: any) {
        lastError = error;
        const finishedAt = new Date();
        const durationMs = finishedAt.getTime() - startedAt.getTime();
        await prisma.scheduledTaskExecution.create({
          data: {
            taskId: task.id,
            status: 'failed',
            attempt: attempt + 1,
            totalAttempts,
            startedAt,
            finishedAt,
            durationMs,
            error: error?.message || 'Execution failed'
          }
        });
        await this.writeExecutionLog(task, 'failed', attempt + 1, totalAttempts, durationMs, error?.message || 'Execution failed');
        if (attempt < retryCount) {
          await this.sleep(retryDelay * 1000);
        }
      }
    }
    throw lastError || new Error('Execution failed');
  }

  cancelJob(taskId: string) {
    if (this.jobs.has(taskId)) {
      this.jobs.get(taskId)?.cancel();
      this.jobs.delete(taskId);
    }
  }

  async reloadTask(taskId: string) {
    const task = await prisma.scheduledTask.findUnique({ where: { id: taskId } });
    if (task) {
      this.scheduleJob(task);
    } else {
      this.cancelJob(taskId);
    }
  }
}

export const schedulerService = new SchedulerService();
