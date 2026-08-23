# 服务器侧优化操作清单（1Panel / Nginx）

本清单对应站点代码仓库无法完成、需要在服务器（1Panel / Nginx）上操作的部分。
实测时间：2026-08-23。

---

## 0. 诊断结论（实测）

| 域名 | 状态 |
|---|---|
| `wanghuanlab.com`（裸域） | ✅ HTTPS 正常，证书 SAN 已覆盖 |
| `www.wanghuanlab.com` | ❌ **证书不匹配**：证书 SAN 不含 `www`，浏览器访问会报 `NET::ERR_CERT_COMMON_NAME_INVALID`；且该域名已下发 HSTS，被强制 HTTPS 后直接拦截 |
| `oss / invest / vibecoding` | ✅ HTTPS 正常（SAN 匹配） |
| `prototype` | ✅ HTTPS 正常（返回 401 属正常鉴权） |
| `1panel / zentao / rag / rocketmq / openclaw / usp / mongo` | ❌ **完全没有 HTTPS**，当前仅 http 可达 |

当前证书 SAN：`api.wanghuanlab.com`、`prototype.wanghuanlab.com`、`qsmjapi.wanghuanlab.com`、`secure.wanghuanlab.com`、`wanghuanlab.com`。

---

## 1. 主域名 www 证书问题（必修）

二选一，推荐 **方案 A**（不引入新域名形态，改动最小）：

### 方案 A：把 www 301 跳转到裸域

在 1Panel 中为 `www.wanghuanlab.com` 新建一个站点（或复用现有站点配置），仅配置跳转：

```nginx
server {
    listen 443 ssl http2;
    server_name www.wanghuanlab.com;

    # 直接沿用裸域同一张证书（证书覆盖 wanghuanlab.com，不含 www，但仅用于跳转，
    # 浏览器校验的是跳转前的 TLS 握手——见下方注意事项）
    ssl_certificate     /path/to/wanghuanlab.com.pem;
    ssl_certificate_key /path/to/wanghuanlab.com.key;

    return 301 https://wanghuanlab.com$request_uri;
}

server {
    listen 80;
    server_name www.wanghuanlab.com;
    return 301 https://wanghuanlab.com$request_uri;
}
```

> ⚠️ 注意：301 跳转发生在 TLS 握手之后，浏览器仍会先校验 www 的证书再跳转。
> 若 1Panel 无法给 www 复用裸域证书，请直接采用方案 B，一次到位。

### 方案 B：给 www 补 SAN（推荐，一劳永逸）

1Panel → 网站 → 选择 `wanghuanlab.com` 的证书 → 重新申请 Let's Encrypt 证书，
在「域名列表」中同时勾选/填写：
- `wanghuanlab.com`
- `www.wanghuanlab.com`
- 以及其他需要 https 的子域（见第 2 节）

申请成功后，给 www 站点配置该证书即可。

### 验证命令

```bash
# 应无报错（证书覆盖 www）
curl -v https://www.wanghuanlab.com -o /dev/null

# 查看证书 SAN 列表，应包含 DNS:www.wanghuanlab.com
echo | openssl s_client -connect www.wanghuanlab.com:443 -servername www.wanghuanlab.com 2>/dev/null \
  | openssl x509 -noout -ext subjectAltName
```

---

## 2. 为 7 个子域名补齐 HTTPS（强烈建议）

涉及：`1panel`、`zentao`、`rag`、`rocketmq`、`openclaw`、`usp`、`mongo`。
这些入口目前只能 http 访问，页面在 HTTPS 环境下也无法对其做在线探测（浏览器混合内容限制），
且从 HTTPS 页面点入体验割裂。

操作步骤（1Panel）：

1. 1Panel → 网站 → 对每个子域站点执行「HTTPS → 申请证书」（Let's Encrypt，自动续签）。
   若某个子域当前没有独立站点（例如走裸域反代），先为它建立站点或使用「反向代理」类型。
2. 申请成功后，确认站点「HTTPS 设置」中启用「强制 HTTPS」，将 http 301 到 https。
3. 各服务自身（1Panel 面板、RocketMQ 控制台、MongoDB Express 等）若监听在 http 端口，
   通过 Nginx 反代 + TLS 终结即可，无需改服务端配置。

完成后的验证：

```bash
for d in 1panel zentao rag rocketmq openclaw usp mongo; do
  curl -sI "https://$d.wanghuanlab.com" -o /dev/null -w "$d -> %{http_code}\n" --max-time 6
done
```

### 配套代码变更（仓库内）

当某个子域可用 https 后，把 `app/data/portals.ts` 中对应入口改为：

```ts
href: "https://xxx.wanghuanlab.com",
https: true,
```

重新 `npm run build:static` 后部署即可；顶栏状态探测会自动开始检测该入口。

---

## 3. Nginx 缓存头：静态资源一年缓存（性能）

当前 `release/` 的资源文件名带内容 hash（如 `index-xxxx.js`），但响应没有
`Cache-Control`，用户每次访问都要回源校验。给 `/assets/` 配置强缓存：

```nginx
location /assets/ {
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $uri =404;
}
```

其余静态文件（`favicon.svg`、`apple-touch-icon.png` 等）可短缓存：

```nginx
location ~* \.(svg|png|jpg|webp|ico|webmanifest|xml|txt)$ {
    expires 7d;
    add_header Cache-Control "public, max-age=604800";
}
```

> 确认压缩是否生效：`curl -sI -H "Accept-Encoding: gzip" https://wanghuanlab.com/assets/index-xxx.js`
> 响应头应出现 `content-encoding: gzip`。若未开启，在 Nginx 主配置启用：
> `gzip on; gzip_types application/javascript text/css application/json image/svg+xml;`

---

## 4. 可选加固

- **HSTS 一致性**：裸域也建议下发 `Strict-Transport-Security`（当前 www 已下发，裸域未确认），
  确保两个域名行为一致。
- **HTTP/2 / HTTP/3**：1Panel 默认 Nginx 通常已启用 HTTP/2；HTTP/3 需额外模块，非必须。
- **安全头**：可加 `X-Content-Type-Options: nosniff`、`Referrer-Policy: strict-origin-when-cross-origin`。
- **百度统计**：统计代码已内嵌在 `index.html`，无需额外操作；可配合 Nginx 日志自行统计 PV/UV。

---

## 5. 部署命令回顾

```bash
# 本地生成 release/ 并运行测试
npm test

# 发布到服务器（替换 /opt/1panel/www/sites/www.wanghuanlab.com/index）
npm run deploy:scp -- root@your-server
```
