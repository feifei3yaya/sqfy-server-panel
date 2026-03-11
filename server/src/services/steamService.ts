
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const STEAM_API_KEY = process.env.STEAM_API_KEY || ''; // 需要在 .env 中配置
const SQUAD_APP_ID = '393380';

class SteamService {
  // 批量获取 Steam 信息并更新数据库
  // 建议在获取玩家列表时异步调用，或者通过定时任务调用
  async syncPlaytime(steamIds: string[]) {
    if (!STEAM_API_KEY) {
      console.warn('Steam API Key not configured. Skipping Steam playtime sync.');
      return;
    }

    // 过滤掉最近已同步的 (例如 12 小时内)
    const playersToUpdate = await prisma.player.findMany({
      where: {
        steamId: { in: steamIds },
        OR: [
          { lastSteamSync: null },
          { lastSteamSync: { lt: new Date(Date.now() - 12 * 60 * 60 * 1000) } }
        ]
      },
      select: { steamId: true }
    });

    if (playersToUpdate.length === 0) return;

    const idsToFetch = playersToUpdate.map(p => p.steamId);
    
    // Steam API 一次最多支持 100 个 ID (对于 IPlayerService 可能是单个查询)
    // GetOwnedGames 只能查单个用户，比较耗时。
    // 如果要查多个，可能需要用 GetPlayerSummaries (但不含游戏时长)。
    // 为了获取时长，必须用 GetOwnedGames，这意味着我们要循环请求。
    // 为了不阻塞，我们分批慢速处理。

    for (const steamId of idsToFetch) {
      try {
        await this.fetchAndSavePlaytime(steamId);
        // 简单的限流，防止触发 Steam API 限制
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to sync Steam playtime for ${steamId}:`, error);
      }
    }
  }

  private async fetchAndSavePlaytime(steamId: string) {
    try {
      const url = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${steamId}&format=json`;
      const response = await axios.get(url, { timeout: 5000 });
      
      const games = response.data?.response?.games;
      if (!games || !Array.isArray(games)) return;

      const squadGame = games.find((g: any) => g.appid.toString() === SQUAD_APP_ID);
      
      if (squadGame) {
        // playtime_forever is in minutes
        await prisma.player.update({
          where: { steamId },
          data: {
            steamPlaytime: squadGame.playtime_forever,
            lastSteamSync: new Date()
          }
        });
      } else {
        // Player owns games but not Squad (Free weekend? Family share? Or private profile)
        // If private profile, games list might be empty.
        // We update sync time anyway to avoid retrying too often.
        await prisma.player.update({
          where: { steamId },
          data: { lastSteamSync: new Date() }
        });
      }

    } catch (error: any) {
        if (error.response && error.response.status === 500) {
            // Steam Internal Server Error, ignore
        } else {
            console.error(`Steam API Error for ${steamId}:`, error.message);
        }
    }
  }

  // 获取单个玩家的 Steam 信息（如果有缓存则直接返回，否则尝试同步）
  async getPlaytime(steamId: string) {
    const player = await prisma.player.findUnique({
      where: { steamId },
      select: { steamPlaytime: true, totalPlaytime: true, lastSteamSync: true }
    });

    if (player) {
      // 如果从未同步过，触发一次后台同步
      if (!player.lastSteamSync && STEAM_API_KEY) {
        this.fetchAndSavePlaytime(steamId).catch(() => {});
      }
      return {
        steam: player.steamPlaytime,
        server: player.totalPlaytime
      };
    }
    return null;
  }
}

export default new SteamService();
