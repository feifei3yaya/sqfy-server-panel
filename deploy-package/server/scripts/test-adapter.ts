/**
 * Squad 服务器管理面板适配测试报告生成器
 */

import { PrismaClient } from '@prisma/client';
import { Rcon as SquadRcon } from 'squad-rcon';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface TestResult {
  testName: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
  timestamp: string;
}

class TestReporter {
  private results: TestResult[] = [];
  
  addResult(testName: string, status: 'pass' | 'fail' | 'warning', message: string, details?: string) {
    this.results.push({
      testName,
      status,
      message,
      details,
      timestamp: new Date().toLocaleString('zh-CN')
    });
  }
  
  generateReport(): string {
    const passCount = this.results.filter(r => r.status === 'pass').length;
    const failCount = this.results.filter(r => r.status === 'fail').length;
    const warningCount = this.results.filter(r => r.status === 'warning').length;
    
    let report = `
# Squad 服务器管理面板适配测试报告

**测试时间**: ${new Date().toLocaleString('zh-CN')}
**测试服务器**: FY 肥鸭服务器 (111.170.155.19:21114)

## 测试摘要

| 总计 | ✅ 通过 | ❌ 失败 | ⚠️ 警告 |
|------|--------|--------|--------|
| ${this.results.length} | ${passCount} | ${failCount} | ${warningCount} |

## 详细测试结果

`;
    
    this.results.forEach((result, index) => {
      const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
      report += `### ${index + 1}. ${result.testName}
- **状态**: ${icon} ${result.status.toUpperCase()}
- **结果**: ${result.message}
${result.details ? `\n**详情**:\n\`\`\`\n${result.details}\n\`\`\`` : ''}

`;
    });
    
    report += `
## 测试结论

${failCount === 0 ? '✅ 所有测试通过，管理面板与 Squad 服务器适配良好！' : `❌ 存在 ${failCount} 项测试失败，需要修复相关问题。`}
${warningCount > 0 ? `⚠️ 存在 ${warningCount} 项警告，建议优化。` : ''}

## 建议

${this.getRecommendations()}
`;
    
    return report;
  }
  
  private getRecommendations(): string {
    const recommendations: string[] = [];
    
    const rconTest = this.results.find(r => r.testName.includes('RCON'));
    if (rconTest && rconTest.status === 'pass') {
      recommendations.push('✅ RCON 连接正常，可以继续使用当前配置。');
    } else if (rconTest && rconTest.status === 'fail') {
      recommendations.push('❌ RCON 连接失败，请检查服务器配置和网络设置。');
    }
    
    const playerTest = this.results.find(r => r.testName.includes('玩家'));
    if (playerTest && playerTest.status === 'pass') {
      recommendations.push('✅ 玩家数据同步正常，管理面板可以正确获取玩家信息。');
    }
    
    const mapTest = this.results.find(r => r.testName.includes('地图'));
    if (mapTest && mapTest.status === 'pass') {
      recommendations.push('✅ 地图信息获取正常，可以显示当前地图和下一张地图。');
    }
    
    if (recommendations.length === 0) {
      return '请查看测试结果详情。';
    }
    
    return recommendations.join('\n');
  }
  
  saveReport(filePath: string) {
    const report = this.generateReport();
    fs.writeFileSync(filePath, report, 'utf-8');
    console.log(`报告已保存至：${filePath}`);
  }
}

async function runTests() {
  console.log('=== Squad 服务器管理面板适配测试 ===\n');
  
  const reporter = new TestReporter();
  
  try {
    // 测试 1: 数据库配置
    console.log('[1/6] 测试数据库服务器配置...');
    const servers = await prisma.server.findMany({
      where: { isPublished: true }
    });
    
    if (servers.length > 0) {
      const server = servers[0];
      reporter.addResult(
        '数据库服务器配置',
        'pass',
        `找到 ${servers.length} 个已配置的服务器`,
        `服务器名称：${server.name}\n地址：${server.host}:${server.rconPort}\n状态：${server.isPublished ? '已发布' : '未发布'}`
      );
      console.log('✅ 数据库配置正常');
    } else {
      reporter.addResult(
        '数据库服务器配置',
        'fail',
        '数据库中没有已发布的服务器配置',
        '请先在管理面板中添加服务器配置'
      );
      console.log('❌ 数据库配置缺失');
      return;
    }
    
    // 测试 2: RCON 连接
    console.log('\n[2/6] 测试 RCON 连接...');
    const server = servers[0];
    let rcon: any;
    
    try {
      rcon = new SquadRcon({
        id: 1,
        host: server.host,
        port: server.rconPort,
        password: server.rconPassword,
        autoReconnect: false
      });
      
      await rcon.init();
      reporter.addResult(
        'RCON 连接测试',
        'pass',
        'RCON 连接成功',
        `服务器：${server.name}\n地址：${server.host}:${server.rconPort}`
      );
      console.log('✅ RCON 连接成功');
    } catch (error: any) {
      reporter.addResult(
        'RCON 连接测试',
        'fail',
        'RCON 连接失败',
        `错误信息：${error.message}`
      );
      console.log('❌ RCON 连接失败:', error.message);
      return;
    }
    
    // 测试 3: 服务器信息
    console.log('\n[3/6] 测试服务器信息获取...');
    try {
      const infoResponse = await rcon.execute('ShowServerInfo');
      const info = JSON.parse(infoResponse);
      
      const details = `服务器名称：${info.ServerName || 'N/A'}\n当前地图：${info.CurrentMap || 'N/A'}\n玩家数量：${info.PlayerCount || 'N/A'}/${info.MaxPlayers || 'N/A'}\n排队人数：${info.PublicQueue || 'N/A'}`;
      
      reporter.addResult(
        '服务器信息获取',
        info.ServerName ? 'pass' : 'warning',
        '成功获取服务器信息',
        details
      );
      console.log('✅ 服务器信息获取成功');
    } catch (error: any) {
      reporter.addResult(
        '服务器信息获取',
        'fail',
        '获取服务器信息失败',
        `错误信息：${error.message}`
      );
      console.log('❌ 服务器信息获取失败');
    }
    
    // 测试 4: 玩家列表
    console.log('\n[4/6] 测试玩家列表获取...');
    try {
      const playersResponse = await rcon.execute('ListPlayers');
      const lines = playersResponse.split('\n').filter((line: string) => line.trim());
      const playerCount = lines.length;
      
      reporter.addResult(
        '玩家列表获取',
        'pass',
        `成功获取 ${playerCount} 条玩家记录`,
        lines.slice(0, 5).join('\n')
      );
      console.log(`✅ 玩家列表获取成功 (${playerCount} 条记录)`);
    } catch (error: any) {
      reporter.addResult(
        '玩家列表获取',
        'fail',
        '获取玩家列表失败',
        `错误信息：${error.message}`
      );
      console.log('❌ 玩家列表获取失败');
    }
    
    // 测试 5: 地图信息
    console.log('\n[5/6] 测试地图信息获取...');
    try {
      const currentMap = await rcon.execute('ShowCurrentMap');
      const nextMap = await rcon.execute('ShowNextMap');
      
      reporter.addResult(
        '地图信息获取',
        'pass',
        '成功获取地图信息',
        `当前地图：${currentMap.trim()}\n下一张地图：${nextMap.trim()}`
      );
      console.log('✅ 地图信息获取成功');
    } catch (error: any) {
      reporter.addResult(
        '地图信息获取',
        'fail',
        '获取地图信息失败',
        `错误信息：${error.message}`
      );
      console.log('❌ 地图信息获取失败');
    }
    
    // 测试 6: RCON 命令执行
    console.log('\n[6/6] 测试 RCON 命令执行...');
    try {
      const testCommand = 'AdminMessage 测试消息';
      const response = await rcon.execute(testCommand);
      
      reporter.addResult(
        'RCON 命令执行',
        'pass',
        'RCON 命令执行成功',
        `测试命令：${testCommand}\n响应：${response}`
      );
      console.log('✅ RCON 命令执行成功');
    } catch (error: any) {
      reporter.addResult(
        'RCON 命令执行',
        'warning',
        'RCON 命令执行失败',
        `错误信息：${error.message}\n注意：某些命令可能需要特定权限`
      );
      console.log('⚠️ RCON 命令执行失败');
    }
    
    // 关闭连接
    if (rcon) {
      await rcon.close();
    }
    
    // 生成报告
    console.log('\n生成测试报告...');
    const reportPath = path.join(process.cwd(), 'test-report.md');
    reporter.saveReport(reportPath);
    
    console.log('\n' + reporter.generateReport());
    
  } catch (error: any) {
    console.error('测试过程出错:', error);
    reporter.addResult(
      '测试流程',
      'fail',
      '测试过程中断',
      `错误信息：${error.message}`
    );
  } finally {
    await prisma.$disconnect();
  }
}

runTests()
  .catch(console.error)
  .finally(() => {
    process.exit(0);
  });
