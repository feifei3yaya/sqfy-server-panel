/**
 * Squad 游戏服务器监控路由
 */

import express from 'express';
import {
  getSquadServerStats,
  getAllSquadServersStats,
  getPlayerStats,
  getTeamStats,
  getSquadStats
} from '../controllers/squadController';
import { authenticateToken, requireServerPermission } from '../middlewares/auth';

const router = express.Router();

/**
 * @route   GET /api/squad/all/stats
 * @desc    获取所有 Squad 服务器状态
 * @access  Private (需要认证)
 */
router.get('/all/stats', authenticateToken, getAllSquadServersStats);

/**
 * @route   GET /api/squad/:serverId/stats
 * @desc    获取指定 Squad 服务器完整状态
 * @access  Private
 */
router.get('/:serverId/stats', authenticateToken, getSquadServerStats);

/**
 * @route   GET /api/squad/:serverId/player/:steamId
 * @desc    获取指定玩家详情
 * @access  Private
 */
router.get('/:serverId/player/:steamId', authenticateToken, getPlayerStats);

/**
 * @route   GET /api/squad/:serverId/team/:teamId
 * @desc    获取指定队伍详情
 * @access  Private
 */
router.get('/:serverId/team/:teamId', authenticateToken, getTeamStats);

/**
 * @route   GET /api/squad/:serverId/team/:teamId/squad/:squadId
 * @desc    获取指定小队详情
 * @access  Private
 */
router.get('/:serverId/team/:teamId/squad/:squadId', authenticateToken, getSquadStats);

export default router;
