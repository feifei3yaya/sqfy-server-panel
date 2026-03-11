#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Squad 服务器管理面板部署脚本
将项目文件上传到远程服务器 D:\SQFY-v1.0.0.0\sqfy-panel
"""

import paramiko
import os
import sys
from pathlib import Path

# 服务器配置
HOST = "43.138.188.183"
PORT = 22
USER = "Administrator"
PASSWORD = "@Kw123456789"
REMOTE_BASE_DIR = "D:/SQFY-v1.0.0.0/sqfy-panel"

# 本地项目根目录
LOCAL_BASE_DIR = Path(__file__).parent.parent.parent

# 需要上传的文件和目录
FILES_TO_UPLOAD = [
    # 后端
    ("server/package.json", "server/package.json"),
    ("server/package-lock.json", "server/package-lock.json"),
    ("server/tsconfig.json", "server/tsconfig.json"),
    ("server/src", "server/src"),
    ("server/prisma", "server/prisma"),
    ("server/config", "server/config"),
    ("server/scripts", "server/scripts"),
    ("server/Dockerfile", "server/Dockerfile"),
    ("server/.gitignore", "server/.gitignore"),
    ("server/babel.config.js", "server/babel.config.js"),
    ("server/jest.config.js", "server/jest.config.js"),
    
    # 前端
    ("client/package.json", "client/package.json"),
    ("client/package-lock.json", "client/package-lock.json"),
    ("client/tsconfig.json", "client/tsconfig.json"),
    ("client/tsconfig.app.json", "client/tsconfig.app.json"),
    ("client/tsconfig.node.json", "client/tsconfig.node.json"),
    ("client/vite.config.ts", "client/vite.config.ts"),
    ("client/index.html", "client/index.html"),
    ("client/src", "client/src"),
    ("client/public", "client/public"),
    ("client/Dockerfile", "client/Dockerfile"),
    ("client/.gitignore", "client/.gitignore"),
    ("client/eslint.config.js", "client/eslint.config.js"),
    ("client/nginx.conf", "client/nginx.conf"),
    ("client/playwright.config.ts", "client/playwright.config.ts"),
    
    # 根目录文件
    ("docker-compose.yml", "docker-compose.yml"),
    (".dockerignore", ".dockerignore"),
    (".gitignore", ".gitignore"),
    (".vercelignore", ".vercelignore"),
    ("vercel.json", "vercel.json"),
    
    # 配置和文档
    ("config/.env.example", "config/.env.example"),
    ("docs/README.md", "docs/README.md"),
    ("docs/PROJECT_STRUCTURE.md", "docs/PROJECT_STRUCTURE.md"),
    
    # 插件
    ("plugins", "plugins"),
]

# 不需要上传的目录
IGNORE_DIRS = [
    "node_modules",
    "dist",
    "build",
    ".git",
    ".vscode",
    ".trae",
    "data",
    "logs",
    "__tests__",
    "test-results",
    "coverage",
]

def should_ignore(path):
    """检查路径是否应该被忽略"""
    path_str = str(path)
    return any(ignore in path_str for ignore in IGNORE_DIRS)

def upload_directory(sftp, local_dir, remote_dir):
    """递归上传目录"""
    try:
        sftp.stat(remote_dir)
    except FileNotFoundError:
        print(f"创建远程目录：{remote_dir}")
        sftp.mkdir(remote_dir)
    
    for item in os.listdir(local_dir):
        local_path = os.path.join(local_dir, item)
        remote_path = f"{remote_dir}/{item}"
        
        if should_ignore(local_path):
            print(f"跳过：{local_path}")
            continue
        
        if os.path.isdir(local_path):
            print(f"上传目录：{local_path} -> {remote_path}")
            upload_directory(sftp, local_path, remote_path)
        else:
            print(f"上传文件：{local_path} -> {remote_path}")
            sftp.put(local_path, remote_path)

def deploy():
    """执行部署"""
    ssh = None
    try:
        print(f"连接到服务器 {HOST}:{PORT}...")
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(HOST, port=PORT, username=USER, password=PASSWORD)
        print("✓ SSH 连接成功")
        
        sftp = ssh.open_sftp()
        print("✓ SFTP 连接成功")
        
        # 创建远程基础目录
        try:
            sftp.stat(REMOTE_BASE_DIR)
        except FileNotFoundError:
            print(f"创建远程基础目录：{REMOTE_BASE_DIR}")
            sftp.mkdir(REMOTE_BASE_DIR)
        
        # 上传文件和目录
        print("\n开始上传文件...")
        for local_file, remote_file in FILES_TO_UPLOAD:
            local_path = LOCAL_BASE_DIR / local_file
            remote_path = f"{REMOTE_BASE_DIR}/{remote_file}"
            
            if not local_path.exists():
                print(f"⚠ 本地文件不存在：{local_path}")
                continue
            
            if local_path.is_dir():
                print(f"\n上传目录：{local_file}")
                upload_directory(sftp, str(local_path), remote_path)
            else:
                print(f"上传文件：{local_file}")
                # 确保远程目录存在
                remote_dir = "/".join(remote_path.split("/")[:-1])
                try:
                    sftp.stat(remote_dir)
                except FileNotFoundError:
                    sftp.mkdir(remote_dir)
                sftp.put(str(local_path), remote_path)
        
        print("\n✓ 部署完成！")
        
        # 验证部署
        print("\n验证部署...")
        try:
            sftp.stat(f"{REMOTE_BASE_DIR}/server/package.json")
            print("✓ 后端文件验证通过")
        except:
            print("✗ 后端文件验证失败")
        
        try:
            sftp.stat(f"{REMOTE_BASE_DIR}/client/package.json")
            print("✓ 前端文件验证通过")
        except:
            print("✗ 前端文件验证失败")
        
        sftp.close()
        ssh.close()
        
        print("\n部署成功！")
        print(f"项目已部署到：{REMOTE_BASE_DIR}")
        
    except Exception as e:
        print(f"\n✗ 部署失败：{e}")
        if ssh:
            ssh.close()
        sys.exit(1)

if __name__ == "__main__":
    deploy()
