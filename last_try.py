
import paramiko
import requests
import time

hostname = "43.138.188.183"
port = 22
username = "Administrator"
password = "@Kw123456789"

print("="*60)
print("最后尝试")
print("="*60)

print(f"\n连接到 {hostname}...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname, port, username, password)
print("✓ 已连接")

sftp = ssh.open_sftp()

print("\n1. 创建启动脚本...")
launcher = r"""
@echo off
echo Starting backend...
cd /d C:\SQFY\backup_old\backend
python -m uvicorn main:app --host 0.0.0.0 --port 80 > C:\SQFY\backend.log 2>&1
"""

with sftp.open(r"C:\SQFY\do_start.bat", "w") as f:
    f.write(launcher)

print("✓ 启动脚本已创建")

print("\n2. 停止所有Python...")
stdin, stdout, stderr = ssh.exec_command('taskkill /F /IM python.exe 2>&1')
time.sleep(4)

print("\n3. 停止IIS...")
stdin, stdout, stderr = ssh.exec_command('iisreset /stop 2>&1')
time.sleep(3)

print("\n4. 启动后端...")
ssh.exec_command(r'C:\SQFY\do_start.bat')
print("后端已启动，等待25秒...")
time.sleep(25)

print("\n5. 检查80端口...")
stdin, stdout, stderr = ssh.exec_command('netstat -ano | findstr ":80"')
print("80端口监听:")
print(stdout.read().decode('gbk', errors='ignore'))

print("\n6. 读取后端日志...")
try:
    with sftp.open(r"C:\SQFY\backend.log", "r") as f:
        log_content = f.read()
        print("后端日志:")
        print(log_content.decode('utf-8', errors='ignore')[-1000:])
except Exception as e:
    print(f"读取日志失败: {e}")

print("\n7. 测试登录...")
try:
    url = "http://43.138.188.183/token"
    data = {
        "username": "FY",
        "password": "123456"
    }
    print(f"正在请求: {url}")
    response = requests.post(url, data=data, timeout=20)
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
