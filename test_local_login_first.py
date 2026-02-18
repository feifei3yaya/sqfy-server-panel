
import bcrypt
import sqlite3
import os

print("="*60)
print("测试本地数据库")
print("="*60)

local_db_path = r"d:\SQFY\backup_old\backend\sql_app.db"

if not os.path.exists(local_db_path):
    print(f"错误: 本地数据库不存在: {local_db_path}")
    exit(1)

print(f"\n本地数据库存在: {local_db_path}")

print("\n连接数据库...")
conn = sqlite3.connect(local_db_path)
cursor = conn.cursor()

print("\n查询用户信息...")
cursor.execute("SELECT id, username, login_code, role FROM users WHERE username = 'FY'")
user = cursor.fetchone()

if user:
    print(f"ID: {user[0]}")
    print(f"用户名: {user[1]}")
    print(f"密码哈希: {user[2][:50]}...")
    print(f"角色: {user[3]}")
    
    print("\n验证密码...")
    plain_password = "123456"
    stored_hash = user[2].encode('utf-8')
    
    if bcrypt.checkpw(plain_password.encode('utf-8'), stored_hash):
        print("✓✓✓ 本地密码验证成功！")
    else:
        print("✗ 本地密码验证失败")
else:
    print("没有找到用户FY")

conn.close()
