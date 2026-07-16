# 欢的实验室

[www.wanghuanlab.com](https://www.wanghuanlab.com/) 的导航入口站点，集中展示 Wanghuan Lab 的服务器工具、智能体、知识库与产品原型。

## 环境要求

- Node.js `>=22.13.0`
- npm

## 本地开发

```bash
npm install
npm run dev
```

## 构建

验证 Vinext 应用构建：

```bash
npm run build
```

生成可直接由 Nginx 或 1Panel 托管的静态版本：

```bash
npm run build:static
```

静态产物位于 `release/`。

## 通过 SCP 发布

部署脚本会执行以下操作：

1. 生成最新静态版本。
2. 将压缩包通过 SCP 上传到服务器。
3. 清理并替换 `/opt/1panel/www/sites/www.wanghuanlab.com/index` 中的文件。

```bash
npm run deploy:scp -- root@your-server
```

使用自定义 SSH 端口：

```bash
DEPLOY_SSH_PORT=2222 npm run deploy:scp -- root@your-server
```

也可以通过 `DEPLOY_SSH_TARGET` 指定服务器。无人值守环境可设置 `DEPLOY_CONFIRM=yes` 跳过人工确认。建议使用 SSH 密钥，不要在脚本或仓库中保存密码。
