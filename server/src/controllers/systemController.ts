/**
 * 系统监控控制器
 * 提供 RESTful API 接口用于获取服务器状态信息
 */

import { Request, Response } from 'express';
import systemMonitorService from '../services/systemMonitorService';

/**
 * 获取完整的系统状态信息
 * GET /api/system/stats
 */
export const getSystemStats = async (req: Request, res: Response) => {
  try {
    const stats = await systemMonitorService.getSystemStats();
    res.json({
      status: 'success',
      data: stats
    });
  } catch (error: any) {
    console.error('获取系统状态失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取系统状态失败',
      error: error.message
    });
  }
};

/**
 * 获取 CPU 统计信息
 * GET /api/system/stats/cpu
 */
export const getCPUStats = async (req: Request, res: Response) => {
  try {
    const cpuStats = await systemMonitorService.getCPUStats();
    res.json({
      status: 'success',
      data: cpuStats
    });
  } catch (error: any) {
    console.error('获取 CPU 状态失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取 CPU 状态失败',
      error: error.message
    });
  }
};

/**
 * 获取内存统计信息
 * GET /api/system/stats/memory
 */
export const getMemoryStats = async (req: Request, res: Response) => {
  try {
    const memoryStats = systemMonitorService.getMemoryStats();
    res.json({
      status: 'success',
      data: memoryStats
    });
  } catch (error: any) {
    console.error('获取内存状态失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取内存状态失败',
      error: error.message
    });
  }
};

/**
 * 获取磁盘统计信息
 * GET /api/system/stats/disk
 */
export const getDiskStats = async (req: Request, res: Response) => {
  try {
    const diskStats = await systemMonitorService.getDiskStats();
    res.json({
      status: 'success',
      data: diskStats
    });
  } catch (error: any) {
    console.error('获取磁盘状态失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取磁盘状态失败',
      error: error.message
    });
  }
};

/**
 * 获取网络统计信息
 * GET /api/system/stats/network
 */
export const getNetworkStats = async (req: Request, res: Response) => {
  try {
    const networkStats = await systemMonitorService.getNetworkStats();
    res.json({
      status: 'success',
      data: networkStats
    });
  } catch (error: any) {
    console.error('获取网络状态失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取网络状态失败',
      error: error.message
    });
  }
};

/**
 * 获取进程统计信息
 * GET /api/system/stats/processes
 */
export const getProcessStats = async (req: Request, res: Response) => {
  try {
    const processStats = await systemMonitorService.getProcessStats();
    res.json({
      status: 'success',
      data: processStats
    });
  } catch (error: any) {
    console.error('获取进程状态失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取进程状态失败',
      error: error.message
    });
  }
};

/**
 * 获取系统健康状态
 * GET /api/system/health
 */
export const getSystemHealth = async (req: Request, res: Response) => {
  try {
    const healthStats = systemMonitorService.getHealthStats();
    res.json({
      status: 'success',
      data: healthStats
    });
  } catch (error: any) {
    console.error('获取系统健康状态失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取系统健康状态失败',
      error: error.message
    });
  }
};

/**
 * 获取系统基本信息
 * GET /api/system/info
 */
export const getSystemInfo = async (req: Request, res: Response) => {
  try {
    const stats = await systemMonitorService.getSystemStats();
    res.json({
      status: 'success',
      data: {
        hostname: stats.hostname,
        platform: stats.platform,
        arch: stats.arch,
        uptime: stats.uptime,
        loadavg: stats.loadavg
      }
    });
  } catch (error: any) {
    console.error('获取系统信息失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取系统信息失败',
      error: error.message
    });
  }
};
