/**
 * Squad 游戏服务器监控控制器
 * 提供 RESTful API 接口用于获取 Squad 服务器状态信息
 */

import { Request, Response } from 'express';
import squadMonitorService from '../services/squadMonitorService';

/**
 * 获取 Squad 服务器完整状态
 * GET /api/squad/:serverId/stats
 */
export const getSquadServerStats = async (req: Request, res: Response) => {
  try {
    const serverId = req.params.serverId as string;
    const stats = await squadMonitorService.getSquadServerStats(serverId);
    
    if (!stats) {
      return res.status(404).json({
        status: 'error',
        message: '服务器未找到'
      });
    }
    
    res.json({
      status: 'success',
      data: stats
    });
  } catch (error: any) {
    console.error('获取 Squad 服务器状态失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取服务器状态失败',
      error: error.message
    });
  }
};

/**
 * 获取所有 Squad 服务器状态
 * GET /api/squad/all/stats
 */
export const getAllSquadServersStats = async (req: Request, res: Response) => {
  try {
    const stats = await squadMonitorService.getAllSquadServersStats();
    
    res.json({
      status: 'success',
      data: stats
    });
  } catch (error: any) {
    console.error('获取所有 Squad 服务器状态失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取服务器状态失败',
      error: error.message
    });
  }
};

/**
 * 获取玩家详情
 * GET /api/squad/:serverId/player/:steamId
 */
export const getPlayerStats = async (req: Request, res: Response) => {
  try {
    const serverId = req.params.serverId as string;
    const steamId = req.params.steamId as string;
    const player = await squadMonitorService.getPlayerStats(serverId, steamId);
    
    if (!player) {
      return res.status(404).json({
        status: 'error',
        message: '玩家未找到'
      });
    }
    
    res.json({
      status: 'success',
      data: player
    });
  } catch (error: any) {
    console.error('获取玩家详情失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取玩家详情失败',
      error: error.message
    });
  }
};

/**
 * 获取队伍详情
 * GET /api/squad/:serverId/team/:teamId
 */
export const getTeamStats = async (req: Request, res: Response) => {
  try {
    const serverId = req.params.serverId as string;
    const teamId = req.params.teamId as string;
    const team = await squadMonitorService.getTeamStats(serverId, teamId);
    
    if (!team) {
      return res.status(404).json({
        status: 'error',
        message: '队伍未找到'
      });
    }
    
    res.json({
      status: 'success',
      data: team
    });
  } catch (error: any) {
    console.error('获取队伍详情失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取队伍详情失败',
      error: error.message
    });
  }
};

/**
 * 获取小队详情
 * GET /api/squad/:serverId/team/:teamId/squad/:squadId
 */
export const getSquadStats = async (req: Request, res: Response) => {
  try {
    const serverId = req.params.serverId as string;
    const teamId = req.params.teamId as string;
    const squadId = req.params.squadId as string;
    const squad = await squadMonitorService.getSquadStats(serverId, teamId, squadId);
    
    if (!squad) {
      return res.status(404).json({
        status: 'error',
        message: '小队未找到'
      });
    }
    
    res.json({
      status: 'success',
      data: squad
    });
  } catch (error: any) {
    console.error('获取小队详情失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取小队详情失败',
      error: error.message
    });
  }
};
