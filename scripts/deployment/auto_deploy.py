#!/usr/bin/env python3
import paramiko
import os
import time
import socket

SERVER_IP = "43.138.188.183"
SERVER_PORT = 22
USERNAME = "Administrator"
PASSWORD = "@Kw123456789"
LOCAL_DIR = r"d:\SQFY-v1.0.0.0"
REMOTE_DIR = r"D:\sqfy-panel"

def connect_ssh():
    print("[1/6] 连接 SSH 服务器...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(SERVER_IP, port=SERVER_PORT, username=USERNAME, password=PASSWORD)
    print("✅ SSH 连接成功")
    return client

def create_remote_structure(ssh):
    print("[2/6] 创建远程目录结构...")
    stdin, stdout, stderr = ssh.exec_command(f"cd D: && cd {REMOTE_DIR} && mkdir server client 2>nul && cd server && mkdir dist 2>nul")
    stdout.read()
    print("✅ 目录结构已创建")

def upload_file(sftp, local_path, remote_path):
    try:
        sftp.put(local_path, remote_path)
        return True
    except Exception as e:
        print(f"❌ 上传失败 {local_path}: {e}")
        return False

def deploy_backend(ssh, sftp):
    print("[3/6] 部署后端服务...")
    
    server_file = os.path.join(LOCAL_DIR, "server", "simple-server.js")
    remote_server_file = f"{REMOTE_DIR}\\server\\simple-server.js"
    
    print(f"  上传 {server_file}...")
    upload_file(sftp, server_file, remote_server_file)
    
    print("  启动 PM2 服务...")
    stdin, stdout, stderr = ssh.exec_command(f"cd {REMOTE_DIR}\\server && pm2 delete all 2>nul && pm2 start simple-server.js --name sqfy-api && pm2 save")
    output = stdout.read().decode('utf-8', errors='ignore')
    print(f"  {output}")
    print("✅ 后端部署完成")

def deploy_frontend(ssh, sftp):
    print("[4/6] 部署前端...")
    
    dist_dir = os.path.join(LOCAL_DIR, "client", "dist")
    remote_dist = f"{REMOTE_DIR}\\client\\dist"
    
    if not os.path.exists(dist_dir):
        print("  ⚠️ dist 目录不存在，先构建前端...")
        return False
    
    print(f"  上传 dist 目录...")
    for root, dirs, files in os.walk(dist_dir):
        rel_path = os.path.relpath(root, dist_dir)
        remote_root = remote_dist if rel_path == '.' else f"{remote_dist}\\{rel_path}"
        
        for d in dirs:
            try:
                sftp.mkdir(f"{remote_root}\\{d}")
            except:
                pass
        
        for f in files:
            local_file = os.path.join(root, f)
            remote_file = f"{remote_root}\\{f}"
            try:
                sftp.put(local_file, remote_file)
            except Exception as e:
                print(f"  ⚠️ 上传 {f} 失败: {e}")
    
    print("✅ 前端部署完成")
    return True

def configure_firewall(ssh):
    print("[5/6] 配置防火墙...")
    stdin, stdout, stderr = ssh.exec_command('netsh advfirewall firewall add rule name="SQFY Panel" dir=in action=allow protocol=TCP localport=3000')
    output = stdout.read().decode('utf-8', errors='ignore')
    print(f"  {output}")
    print("✅ 防火墙配置完成")

def check_service(ssh):
    print("[6/6] 验证服务...")
    time.sleep(2)
    
    stdin, stdout, stderr = ssh.exec_command("pm2 status")
    output = stdout.read().decode('utf-8', errors='ignore')
    print(f"  PM2 状态:\n{output}")
    
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex((SERVER_IP, 3000))
        sock.close()
        if result == 0:
            print("✅ 服务已在端口 3000 运行")
        else:
            print("⚠️ 端口 3000 未开放")
    except Exception as e:
        print(f"⚠️ 无法检查端口: {e}")

def main():
    print("="*50)
    print("  Squad 面板 - 自动化服务器部署")
    print("="*50)
    print()
    
    ssh = connect_ssh()
    sftp = ssh.open_sftp()
    
    create_remote_structure(ssh)
    deploy_backend(ssh, sftp)
    deploy_frontend(ssh, sftp)
    configure_firewall(ssh)
    check_service(ssh)
    
    sftp.close()
    ssh.close()
    
    print()
    print("="*50)
    print("  🎉 部署完成！")
    print("="*50)
    print()
    print(f"访问地址:")
    print(f"  - API: http://{SERVER_IP}:3000")
    print(f"  - 前端: http://{SERVER_IP}:3000")
    print()

if __name__ == "__main__":
    main()
