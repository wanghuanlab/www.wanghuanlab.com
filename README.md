# 欢的实验室

[wanghuanlab.com](https://wanghuanlab.com/) 的导航入口站点，集中展示 Wanghuan Lab 的服务器工具、智能体、知识库与产品原型。

> 站点规范域名为裸域 `wanghuanlab.com`（`www` 前缀需在服务器侧做 301 跳转或补证书，见
> [docs/server-optimization.md](docs/server-optimization.md)）。

## 功能

- 11 个服务入口按分类筛选
- HTTPS 入口在线状态实时探测（顶栏可点击刷新），HTTP 入口明确标注
- `Cmd+K` / `Ctrl+K` 快速搜索全部入口
- 点击自动记录最近访问（「最近」标签页），卡片可手动置顶（★）
- Lite 低功耗模式：默认关闭，顶栏可手动开启（减少背景动效与悬停音效）
- 悬停合成音效、Lightfall 光雨背景、网易云音乐胶囊
- ABOUT / UPDATES 面板、百度统计

## 环境要求

- Node.js `>=22.13.0`
- npm

## 本地开发

```bash
npm install
npm run dev
```

## 构建与测试

验证静态构建并运行冒烟测试：

```bash
npm test
```

生成可直接由 Nginx 或 1Panel 托管的静态版本：

```bash
npm run build:static
```

静态产物位于 `release/`。`tests/` 中的测试会对 `release/` 产物与 `app/data/portals.ts`
数据源做校验（入口数量、唯一 ID、元数据、favicon/manifest 等静态资源）。

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

## 内容维护

入口数据集中在 `app/data/portals.ts`（标题、描述、域名、分类、成熟度标签、图标、是否 HTTPS、
是否旗舰大卡），新增或修改入口只需编辑该文件，无需改动组件与样式。

## 服务器侧优化

证书 / HTTPS / 缓存头等需要 1Panel 或 Nginx 操作的事项，见
[docs/server-optimization.md](docs/server-optimization.md)。
