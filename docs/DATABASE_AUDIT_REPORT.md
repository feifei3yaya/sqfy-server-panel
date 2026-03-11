# Squad 面板数据库配置审计报告

**审计日期**: 2026-03-12  
**审计人员**: 自动化部署系统  
**服务器**: 43.138.188.183  
**数据库类型**: SQLite  
**数据库文件**: dev.db (350MB)

---

## 📊 一、当前数据库配置概览

### 1.1 数据库连接配置

| 配置项 | 当前值 | 状态 |
|--------|--------|------|
| 数据库类型 | SQLite | ⚠️ 建议迁移到 PostgreSQL |
| 连接字符串 | `file:./prisma/dev.db` | ⚠️ 相对路径，存在风险 |
| 数据库位置 | D:\sqfy-panel\server\prisma\dev.db | ✅ 已确认 |
| 数据库大小 | 350MB | ✅ 正常 |

### 1.2 环境变量配置

```env
DATABASE_URL=file:./prisma/dev.db
JWT_SECRET=sqfy-panel-2026-production-key-8f7d9c2b1a3e5f7g
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

**评估**: 
- ✅ JWT_SECRET 长度足够（36字符）
- ✅ 已设置生产环境标志
- ⚠️ 数据库使用 SQLite，不适合高并发生产环境

---

## ⚠️ 二、发现的问题与风险

### 🔴 严重问题（必须修复）

#### 1. 使用 SQLite 作为生产数据库
**风险等级**: 🔴 高

**问题描述**:
- SQLite 是文件型数据库，不适合多用户并发访问
- 没有用户权限管理机制
- 缺乏高级数据库特性（事务隔离、连接池等）
- 单文件存储，文件损坏风险高

**影响**:
- 高并发时可能出现数据库锁定
- 数据一致性难以保证
- 无法水平扩展

**建议**:
迁移到 PostgreSQL 或 MySQL 数据库

#### 2. 数据库文件路径使用相对路径
**风险等级**: 🟡 中

**问题描述**:
```
DATABASE_URL=file:./prisma/dev.db
```

**风险**:
- 工作目录变化时可能找不到数据库
- 备份和迁移困难

**建议**:
使用绝对路径：
```
DATABASE_URL=file:D:/sqfy-panel/data/production.db
```

#### 3. 缺乏数据库备份机制
**风险等级**: 🔴 高

**问题描述**:
- 没有自动备份脚本
- 没有备份策略
- 数据丢失风险极高

**影响**:
- 服务器故障时数据可能永久丢失
- 无法恢复到历史版本

---

### 🟡 中等问题（建议修复）

#### 4. 数据库索引优化不足
**风险等级**: 🟡 中

**问题描述**:
查看 schema.prisma 发现部分表缺少必要的索引：

```prisma
// 缺少索引的表
model SystemLog {
  // 只有 timestamp, level, category 有索引
  // 但 source 和 message 经常用于搜索，缺少索引
}

model GameEvent {
  // 缺少 serverId + timestamp 复合索引
}
```

**建议**:
添加复合索引优化查询性能：
```prisma
model GameEvent {
  @@index([serverId, timestamp])
  @@index([type, timestamp])
}
```

#### 5. 敏感数据明文存储
**风险等级**: 🟡 中

**问题描述**:
```prisma
model Server {
  rconPassword  String    // RCON 密码明文存储
  filePassword  String?   // 文件访问密码明文存储
}
```

**建议**:
- 使用加密存储敏感信息
- 或使用环境变量动态获取

#### 6. 缺乏数据库连接池配置
**风险等级**: 🟡 中

**问题描述**:
Prisma Client 没有配置连接池参数

**建议**:
```typescript
// 添加连接池配置
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // 连接池配置
  connectionLimit: 20,
  poolTimeout: 30,
})
```

---

### 🟢 低优先级问题（可选优化）

#### 7. 数据类型优化
- 部分 JSON 字段使用 String 存储，建议使用 Json 类型
- 时间戳字段可以考虑添加时区支持

#### 8. 外键约束
- 部分关系缺少 `onDelete` 策略
- 建议统一添加级联删除或限制删除

---

## ✅ 三、当前配置的优点

### 1. 数据模型设计合理
- 表结构清晰，关系明确
- 支持多服务器管理
- 完善的权限系统（RBAC）

### 2. 审计日志完善
- 操作日志（AuditLog）
- 系统日志（SystemLog）
- 登录历史（LoginHistory）

### 3. 性能优化措施
- 关键表已添加索引
- 使用 UUID 作为主键
- 支持软删除（通过关系约束）

---

## 🔧 四、生产环境配置建议

### 4.1 立即执行（必须）

#### 1. 创建数据库备份脚本

创建文件 `D:\sqfy-panel\scripts\backup-db.bat`:

```batch
@echo off
chcp 65001 >nul
set BACKUP_DIR=D:\sqfy-panel\backups
set DB_FILE=D:\sqfy-panel\server\prisma\dev.db
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

if not exist %BACKUP_DIR% mkdir %BACKUP_DIR%

echo 正在备份数据库...
copy "%DB_FILE%" "%BACKUP_DIR%\dev_%TIMESTAMP%.db"

:: 保留最近 7 天的备份
forfiles /P "%BACKUP_DIR%" /S /M *.db /D -7 /C "cmd /c del @path"

echo 备份完成: %BACKUP_DIR%\dev_%TIMESTAMP%.db
```

#### 2. 配置 Windows 计划任务

每天凌晨 3 点自动备份：
```powershell
schtasks /create /tn "SQFY Database Backup" /tr "D:\sqfy-panel\scripts\backup-db.bat" /sc daily /st 03:00
```

#### 3. 更新数据库路径为绝对路径

修改 `.env`:
```env
DATABASE_URL=file:D:/sqfy-panel/data/production.db
```

创建数据目录：
```batch
mkdir D:\sqfy-panel\data
```

### 4.2 短期优化（建议1周内完成）

#### 1. 迁移到 PostgreSQL

安装 PostgreSQL:
```powershell
# 下载并安装 PostgreSQL
# 创建数据库和用户
```

更新 schema.prisma:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

更新 .env:
```env
DATABASE_URL="postgresql://sqfy_user:your_password@localhost:5432/sqfy_production?schema=public"
```

数据迁移:
```bash
npx prisma migrate dev --name init
npx prisma db seed  # 如果有种子数据
```

#### 2. 加密敏感数据

创建加密工具:
```typescript
// utils/crypto.ts
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = process.env.ENCRYPTION_KEY!;

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(encryptedText: string): string {
  const [ivHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipher(ALGORITHM, KEY);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

#### 3. 添加数据库监控

创建监控脚本:
```typescript
// 定期检查数据库健康
setInterval(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database health check: OK');
  } catch (error) {
    console.error('Database health check failed:', error);
    // 发送告警
  }
}, 60000); // 每分钟检查一次
```

### 4.3 长期优化（建议1个月内完成）

#### 1. 数据库读写分离
- 配置主从复制
- 读操作走从库
- 写操作走主库

#### 2. 连接池优化
```typescript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
```

#### 3. 数据归档策略
- 定期归档历史数据
- 清理过期日志
- 分区表优化

---

## 📋 五、配置检查清单

### 生产环境必备

- [ ] 数据库备份脚本
- [ ] 自动备份计划任务
- [ ] 数据库监控告警
- [ ] 敏感数据加密
- [ ] 数据库连接池配置
- [ ] 数据库性能监控
- [ ] 灾难恢复预案

### 安全要求

- [ ] 数据库访问控制
- [ ] 密码复杂度策略
- [ ] 定期密码更换
- [ ] 审计日志完整
- [ ] 数据加密传输

### 性能优化

- [ ] 索引优化
- [ ] 查询优化
- [ ] 连接池配置
- [ ] 缓存策略
- [ ] 读写分离

---

## 🎯 六、优先级建议

### 🔴 P0 - 立即执行（24小时内）
1. 创建数据库备份脚本
2. 配置自动备份任务
3. 迁移数据库到绝对路径

### 🟡 P1 - 本周内完成
1. 迁移到 PostgreSQL
2. 加密敏感数据
3. 添加数据库监控

### 🟢 P2 - 本月内完成
1. 数据库读写分离
2. 性能优化
3. 高可用架构

---

## 📞 七、技术支持

如需进一步协助，请联系开发团队。

**报告生成时间**: 2026-03-12  
**下次审计建议时间**: 2026-04-12
