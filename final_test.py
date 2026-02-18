
# -*- coding: utf-8 -*-
import requests

print("=" * 60)
print("最终登录测试")
print("=" * 60)

urls = [
    "http://sq-fy.cn/token",
    "http://43.138.188.183/token"
]

data = {
    "username": "FY",
    "password": "123456"
}

for url in urls:
    print(f"\n测试: {url}")
    try:
        response = requests.post(url, data=data, timeout=10)
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.text}")
        
        if response.status_code == 200:
            print("\n🎉 登录成功！问题已完全解决！")
            print("\n" + "=" * 60)
            print("✅ 完成！")
            print("\n📝 登录信息:")
            print("   用户名: FY")
            print("   密码: 123456")
            print("\n🌐 访问地址:")
            print("   http://sq-fy.cn")
            print("   http://www.sq-fy.cn")
            print("   http://43.138.188.183")
            print("\n现在可以直接访问网站登录了！")
            print("=" * 60)
            break
    except Exception as e:
        print(f"错误: {e}")

print("\n测试完成")

