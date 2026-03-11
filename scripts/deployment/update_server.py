#!/usr/bin/env python3
import paramiko
import os

SERVER_IP = "43.138.188.183"
USERNAME = "Administrator"
PASSWORD = "@Kw123456789"
LOCAL_FILE = r"d:\SQFY-v1.0.0.0\server\simple-server.js"
REMOTE_FILE = r"D:\sqfy-panel\server\simple-server.js"

def main():
    print("="*50)
    print("  更新服务器文件")
    print("="*50)
    print()
    
    # 连接 SSH
    print("[1/3] 连接服务器...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(SERVER_IP, username=USERNAME, password=PASSWORD)
    print("✅ 连接成功")
    
    # 上传文件
    print("[2/3] 上传更新后的文件...")
    sftp = client.open_sftp()
    sftp.put(LOCAL_FILE, REMOTE_FILE)
    sftp.close()
    print("✅ 文件已上传")
    
    # 重启服务
    print("[3/3] 重启服务...")
    stdin, stdout, stderr = client.exec_command("cd D:\\sqfy-panel\\server && pm2 restart sqfy-api")
    output = stdout.read().decode('utf-8', errors='ignore')
    print(f"  {output}")
    print("✅ 服务已重启")
    
    # 检查状态
    stdin, stdout, stderr = client.exec_command("pm2 status")
    output = stdout.read().decode('utf-8', errors='ignore')
    print(f"\n  PM2 状态:\n{output}")
    
    client.close()
    
    print()
    print("="*50)
    print("  ✅ 更新完成！")
    print("="*50)
    print()
    print("访问地址:")
    print(f"  http://{SERVER_IP}:3000")
    print()

if __name__ == "__main__":
    main()
