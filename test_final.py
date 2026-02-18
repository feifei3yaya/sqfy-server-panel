
# -*- coding: utf-8 -*-
"""
最终测试登录
"""
import requests
import json

def test_final_login():
    print("=" * 60)
    print("最终测试登录")
    print("=" * 60)
    
    # 测试地址
    url = "http://43.138.188.183:8000/token"
    
    print(f"\nAPI地址: {url}")
    
    # 测试数据
    data = {
        "username": "FY",
        "password": "123456"
    }
    
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    print(f"\n测试登录 - 用户名: {data['username']}, 密码: {data['password']}")
    
    try:
        response = requests.post(url, headers=headers, data=data, timeout=10)
        
        print(f"\n响应状态码: {response.status_code}")
        print(f"响应内容: {response.text}")
        
        if response.status_code == 200:
            print("\n✓ 登录成功!")
            token_data = response.json()
            print(f"访问令牌: {token_data.get('access_token', 'N/A')[:50]}...")
            
            # 测试获取用户信息
            access_token = token_data.get('access_token')
            if access_token:
                print("\n--- 测试获取用户信息 ---")
                user_url = "http://43.138.188.183:8000/api/v1/users/me/"
                user_headers = {
                    "Authorization": f"Bearer {access_token}"
                }
                user_response = requests.get(user_url, headers=user_headers, timeout=10)
                print(f"用户信息响应: {user_response.status_code}")
                print(f"用户信息: {user_response.text}")
            
            print("\n" + "=" * 60)
            print("🎉 登录问题已完全解决!")
            print("\n现在你可以使用以下账号登录:")
            print("  用户名: FY")
            print("  密码: 123456")
            print("\n访问地址:")
            print("  http://sq-fy.cn")
            print("  http://www.sq-fy.cn")
            print("  http://43.138.188.183")
            print("=" * 60)
            
        else:
            print(f"\n✗ 登录失败，状态码: {response.status_code}")
            
    except Exception as e:
        print(f"\n错误: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_final_login()

