# -*- coding: utf-8 -*-
import requests
import time

SERVER_IP = "43.138.188.183"
DOMAIN = "sq-fy.cn"

print("正在测试域名访问...")

print(f"\n1. 测试直接访问 IP: http://{SERVER_IP}")
try:
    r = requests.get(f"http://{SERVER_IP}", timeout=15)
    print(f"   状态: {r.status_code}")
    print(f"   成功: 可以通过 IP 访问")
except Exception as e:
    print(f"   错误: {e}")

print(f"\n2. 测试访问域名: http://{DOMAIN}")
try:
    r = requests.get(f"http://{DOMAIN}", timeout=15)
    print(f"   状态: {r.status_code}")
    print(f"   成功: 域名已经可以访问了！")
    print(f"\n🎉 访问地址: http://{DOMAIN}")
except Exception as e:
    print(f"   域名暂时无法访问: {e}")
    print("\n需要配置 DNS 解析...")
    print("\n请按以下步骤操作：")
    print(f"1. 登录腾讯云控制台")
    print(f"2. 进入 DNS 解析管理")
    print(f"3. 找到域名 {DOMAIN}")
    print(f"4. 添加 A 记录：")
    print(f"   - 主机记录: @ (或留空)")
    print(f"   - 记录类型: A")
    print(f"   - 记录值: {SERVER_IP}")
    print(f"5. 还可以添加 www 记录：")
    print(f"   - 主机记录: www")
    print(f"   - 记录类型: A")
    print(f"   - 记录值: {SERVER_IP}")
    print("\n配置完成后，等待几分钟 DNS 生效，然后就可以通过 http://sq-fy.cn 访问了！")
