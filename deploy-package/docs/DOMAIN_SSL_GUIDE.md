# 域名与 SSL 部署指南 (Windows Server)

本指南将指导您配置 Nginx 反向代理，绑定域名 `www.sq-fy.cn`，并使用 Let's Encrypt 启用 HTTPS。

## 前置准备

1.  **域名解析**：确保 `www.sq-fy.cn` 和 `sq-fy.cn` 已解析到服务器 IP `43.138.188.183`。
2.  **端口开放**：确保服务器防火墙（Windows Firewall 和云服务商安全组）已开放 **80** 和 **443** 端口。
3.  **停止占用**：确保 80/443 端口未被 IIS 或其他服务占用。

## 步骤 1：安装 Nginx

1.  下载 Nginx for Windows: http://nginx.org/en/download.html (选择 Stable version)
2.  解压压缩包到 `D:\nginx`（建议路径，方便管理）。
3.  将项目中的 `deploy-package/nginx.conf` 复制并覆盖 `D:\nginx\conf\nginx.conf`。
4.  修改 `nginx.conf` 中的路径（如果您的部署路径不是 `D:/sqfy-panel`）：
    ```nginx
    root   D:/sqfy-panel/client/dist;
    ```

## 步骤 2：生成 SSL 证书 (使用 win-acme)

推荐使用 **win-acme** 自动申请和续期 Let's Encrypt 证书。

1.  下载 **win-acme** (Pluggable): https://github.com/win-acme/win-acme/releases
2.  解压到服务器上的某个目录，例如 `D:\win-acme`。
3.  以**管理员身份**运行 `wacs.exe`。
4.  按照提示操作：
    -   输入 `N` (Create new certificate with simple options)。
    -   选择 `1` (Single binding of an IIS site) 或 `2` (Manual input)。**选择 2 (Manual input)**。
    -   输入主机名：`www.sq-fy.cn,sq-fy.cn` (回车确认)。
    -   验证方式：选择 `1` (Save file on local (network) path)。
    -   输入验证文件路径：`D:\nginx\html` (对应 nginx.conf 中的 `location /.well-known/acme-challenge/` root 路径)。
    -   CSR 密钥类型：默认 (RSA Key)。
    -   存储方式：选择 `2` (PEM encoded files)。
    -   输入证书保存路径：`D:\nginx\cert`。
    -   不需要密码（直接回车）。
    -   后续步骤默认即可。

5.  win-acme 将会自动生成证书文件到 `D:\nginx\cert`。

## 步骤 3：最终配置 Nginx

1.  确保 `D:\nginx\cert` 目录下有 `fullchain.pem` (或类似名称) 和 `privkey.pem`。
    -   *注意：win-acme 生成的文件名可能不同（如 `www.sq-fy.cn-crt.pem` 和 `www.sq-fy.cn-key.pem`）。请根据实际文件名修改 `nginx.conf`。*

    打开 `D:\nginx\conf\nginx.conf`，修改 SSL 部分：
    ```nginx
    ssl_certificate      ../cert/www.sq-fy.cn-crt.pem;  # 修改为实际生成的证书文件名
    ssl_certificate_key  ../cert/www.sq-fy.cn-key.pem;  # 修改为实际生成的私钥文件名
    ```

2.  启动 Nginx：
    -   打开命令提示符 (CMD)，进入 Nginx 目录：`cd D:\nginx`
    -   启动：`start nginx`
    -   重载配置（修改配置后）：`nginx -s reload`
    -   停止：`nginx -s stop`

## 步骤 4：验证 HTTPS

1.  在浏览器访问 `http://www.sq-fy.cn`，应自动跳转到 `https://www.sq-fy.cn`。
2.  检查浏览器地址栏的小锁图标，确保证书有效。
3.  测试 API 和 WebSocket：登录面板，查看实时数据是否正常更新。

## 步骤 5：设置开机自启 (可选)

使用 **WinSW** 将 Nginx 注册为 Windows 服务。

1.  下载 WinSW: https://github.com/winsw/winsw/releases
2.  将 `WinSW.exe` 复制到 `D:\nginx`，重命名为 `nginx-service.exe`。
3.  创建配置文件 `nginx-service.xml`：
    ```xml
    <service>
      <id>nginx</id>
      <name>Nginx</name>
      <description>Nginx Web Server</description>
      <logpath>D:\nginx\logs</logpath>
      <logmode>roll</logmode>
      <depend></depend>
      <executable>D:\nginx\nginx.exe</executable>
      <stopexecutable>D:\nginx\nginx.exe -s stop</stopexecutable>
    </service>
    ```
4.  以管理员身份运行 CMD，执行：
    ```cmd
    nginx-service.exe install
    nginx-service.exe start
    ```

## 常见问题排查

-   **Nginx 启动失败**：检查 `logs/error.log`。常见原因是端口被占用（IIS 默认占用 80）。
    -   解决方法：停止 IIS (`net stop http` 或在服务管理器中停止 "World Wide Web Publishing Service")。
-   **证书生成失败**：确保 Nginx 已启动且监听 80 端口，且 `/.well-known/acme-challenge/` 路径可被公网访问。
    -   测试方法：在 `D:\nginx\html\.well-known\acme-challenge\` 下创建一个文本文件 `test.txt`，尝试通过 `http://www.sq-fy.cn/.well-known/acme-challenge/test.txt` 访问。
