
import paramiko
import requests
import time
import bcrypt
import sqlite3

hostname = "43.138.188.183"
port = 22
username = "Administrator"
password = "@Kw123456789"

print("="*60)
print("重新上传数据库")
print("="*60)

local_db = r"d:\SQFY\backup_old\backend\sql_app.db"

print(f"\n1. 验证本地数据库密码...")
conn = sqlite3.connect(local_db)
cursor = conn.cursor()
cursor.execute("SELECT username, login_code FROM users WHERE username = 'FY'")
user = cursor.fetchone()
conn.close()

if user:
    print(f"用户名: {user[0]}")
    stored_hash = user[1].encode('utf-8')
    if bcrypt.checkpw(b'123456', stored_hash):
        print("✓ 本地数据库密码验证成功！")
    else:
        print("✗ 本地数据库密码验证失败！")

print(f"\n连接到 {hostname}...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname, port, username, password)
print("✓ 已连接")

sftp = ssh.open_sftp()

print("\n2. 停止后端...")
stdin, stdout, stderr = ssh.exec_command('taskkill /F /IM python.exe 2>&1')
time.sleep(3)

print("\n3. 上传本地数据库...")
remote_db = r"C:\SQFY\backup_old\backend\sql_app.db"
sftp.put(local_db, remote_db)
print("✓ 数据库已上传")

print("\n4. 启动后端...")
ssh.exec_command(r'cd C:\SQFY\backup_old\backend ; start /B python -m uvicorn main:app --host 0.0.0.0 --port 80')
print("后端正在启动，等待15秒...")
time.sleep(15)

print("\n5. 检查80端口...")
stdin, stdout, stderr = ssh.exec_command('netstat -ano | findstr ":80"')
print("80端口监听:")
print(stdout.read().decode('gbk', errors='ignore'))

print("\n6. 测试登录...")
try:
    url = "http://43.138.188.183/token"
    data = {
        "username": "FY",
        "password": "123456"
    }
    print(f"正在请求: {url}")
    response = requests.post(url, data=data, timeout=15)
    print(f"状态码: {response.status_code}")
    print(f"响应: {response.text}")
    
    if response.status_code == 200:
        print("\n" + "="*60)
        print("✓✓✓ 登录成功！问题已解决！✓✓✓")
        print("="*60)
        
        print("\n现在您可以访问 http://www.sq-fy.cn/login")
        print("使用账号: FY")
        print("使用密码: 123456")
    else:
        print("\n登录失败")
        
except Exception as e:
    print(f"测试失败: {e}")

sftp.close()
ssh.close()
