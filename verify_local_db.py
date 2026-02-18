
# -*- coding: utf-8 -*-
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backup_old', 'backend'))

import sqlite3
import auth

print("=" * 60)
print("本地数据库验证")
print("=" * 60)

db_path = os.path.join(os.path.dirname(__file__), 'backup_old', 'backend', 'sql_app.db')
print(f"\n数据库: {db_path}")

conn = sqlite3.connect(db_path)
c = conn.cursor()

c.execute('SELECT id, username, login_code, role FROM users')
users = c.fetchall()

print(f"\n找到 {len(users)} 个用户:")
for uid, uname, lc, role in users:
    print(f"\n用户: {uname} (角色: {role})")
    print(f"哈希: {lc[:60]}...")
    
    for pwd in ['123456', 'fy', 'admin']:
        try:
            ok = auth.verify_password(pwd, lc)
            print(f"  密码 '{pwd}': {'✓ 正确' if ok else '✗ 错误'}")
        except Exception as e:
            print(f"  密码 '{pwd}': 错误 - {e}")

conn.close()

print("\n" + "=" * 60)

