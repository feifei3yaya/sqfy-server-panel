
# -*- coding: utf-8 -*-
"""
简单测试登录
"""
import requests
import time

print("=" * 60)
print("测试登录")
print("=" * 60)

urls_to_test = [
    "http://sq-fy.cn/token",
    "http://www.sq-fy.cn/token",
    "http://43.138.188.183/token",
]

data = {
    "username": "FY",
    "password": "123456"
}

headers = {
    "Content-Type": "application/x-www-form-urlencoded"
}

for url in urls_to_test:
    print(f"\n测试: {url}")
    try:
        response = requests.post(url, headers=headers, data=data, timeout=10)
        print(f"  状态码: {response.status_code}")
        print(f"  响应: {response.text}")
        
        if response.status_code == 200:
            print("\n🎉 登录成功！")
            print("\n" + "=" * 60)
            print("✅ 问题已解决！")
            print("\n📝 登录信息:")
            print("   用户名: FY")
            print("   密码: 123456")
            print("\n🌐 访问地址:")
            print("   http://sq-fy.cn")
            print("   http://www.sq-fy.cn")
            print("   http://43.138.188.183")
            print("=" * 60)
            break
    except Exception as e:
        print(f"  错误: {e}")

print("\n测试完成")

