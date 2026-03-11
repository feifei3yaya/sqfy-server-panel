/**
 * 系统监控路由
 */

import express from 'express';
import {
  getSystemStats,
  getCPUStats,
  getMemoryStats,
  getDiskStats,
  getNetworkStats,
  getProcessStats,
  getSystemHealth,
  getSystemInfo
} from '../controllers/systemController';
import { authenticateToken } from '../middlewares/auth';

const router = express.Router();

/**
 * @route   GET /api/system/stats
 * @desc    获取完整的系统状态信息
 * @access  Private (需要认证)
 */
router.get('/stats', authenticateToken, getSystemStats);

/**
 * @route   GET /api/system/stats/cpu
 * @desc    获取 CPU 统计信息
 * @access  Private
 */
router.get('/stats/cpu', authenticateToken, getCPUStats);

/**
 * @route   GET /api/system/stats/memory
 * @desc    获取内存统计信息
 * @access  Private
 */
router.get('/stats/memory', authenticateToken, getMemoryStats);

/**
 * @route   GET /api/system/stats/disk
 * @desc    获取磁盘统计信息
 * @access  Private
 */
router.get('/stats/disk', authenticateToken, getDiskStats);

/**
 * @route   GET /api/system/stats/network
 * @desc    获取网络统计信息
 * @access  Private
 */
router.get('/stats/network', authenticateToken, getNetworkStats);

/**
 * @route   GET /api/system/stats/processes
 * @desc    获取进程统计信息
 * @access  Private
 */
router.get('/stats/processes', authenticateToken, getProcessStats);

/**
 * @route   GET /api/system/health
 * @desc    获取系统健康状态
 * @access  Private
 */
router.get('/health', authenticateToken, getSystemHealth);

/**
 * @route   GET /api/system/info
 * @desc    获取系统基本信息
 * @access  Private
 */
router.get('/info', authenticateToken, getSystemInfo);

export default router;
