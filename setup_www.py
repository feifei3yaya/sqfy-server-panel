# -*- coding: utf-8 -*-
import requests

SERVER_IP = "43.138.188.183"
DOMAIN = "sq-fy.cn"
WWW_DOMAIN = "www.sq-fy.cn"

print("正在测试域名访问...")

print(f"\n1. 测试主域名: http://{DOMAIN}")
try:
    r = requests.get(f"http://{DOMAIN}", timeout=15)
    print(f"   状态: {r.status_code}")
    print(f"   成功: 主域名可以访问")
except Exception as e:
    print(f"   错误: {e}")

print(f"\n2. 测试 www 域名: http://{WWW_DOMAIN}")
try:
    r = requests.get(f"http://{WWW_DOMAIN}", timeout=15)
    print(f"   状态: {r.status_code}")
    print(f"\n🎉 www 域名已经可以访问了！")
    print(f"\n访问地址: http://{WWW_DOMAIN}")
except Exception as e:
    print(f"   www 域名暂时无法访问: {e}")
    print("\n需要在腾讯云 DNS 解析中添加 www 记录...")
    print("\n请按以下步骤操作：")
    print(f"1. 登录腾讯云控制台")
    print(f"2. 进入 DNS 解析管理")
    print(f"3. 找到域名 {DOMAIN}")
    print(f"4. 添加 A 记录：")
    print(f"   - 主机记录: www")
    print(f"   - 记录类型: A")
    print(f"   - 记录值: {SERVER_IP}")
    print(f"\n配置完成后，等待几分钟 DNS 生效，然后就可以通过 http://{WWW_DOMAIN} 访问了！")
    print(f"\n同时你也可以通过以下地址访问：")
    print(f"   http://{DOMAIN}")
    print(f"   http://{SERVER_IP}")
