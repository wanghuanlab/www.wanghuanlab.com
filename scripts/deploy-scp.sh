#!/usr/bin/env bash
set -euo pipefail

REMOTE_PATH="/opt/1panel/www/sites/www.wanghuanlab.com/index"
SSH_TARGET="${1:-${DEPLOY_SSH_TARGET:-}}"
SSH_PORT="${DEPLOY_SSH_PORT:-22}"

if [[ -z "$SSH_TARGET" ]]; then
  echo "用法: npm run deploy:scp -- <SSH用户名@服务器地址>"
  echo "示例: npm run deploy:scp -- root@example.com"
  echo "也可以设置 DEPLOY_SSH_TARGET 和 DEPLOY_SSH_PORT 环境变量。"
  exit 2
fi

if [[ ! "$SSH_TARGET" =~ ^[A-Za-z0-9._@:-]+$ ]]; then
  echo "SSH 目标格式不安全或不受支持: $SSH_TARGET" >&2
  exit 2
fi

if [[ ! "$SSH_PORT" =~ ^[0-9]+$ ]] || (( SSH_PORT < 1 || SSH_PORT > 65535 )); then
  echo "SSH 端口无效: $SSH_PORT" >&2
  exit 2
fi

if [[ "${DEPLOY_CONFIRM:-}" != "yes" ]]; then
  echo "即将构建并替换远程目录："
  echo "  $SSH_TARGET:$REMOTE_PATH"
  read -r -p "输入 DEPLOY 继续: " confirmation
  if [[ "$confirmation" != "DEPLOY" ]]; then
    echo "已取消。"
    exit 1
  fi
fi

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_root"

npm run build:static

if [[ ! -f release/index.html ]]; then
  echo "静态构建失败：release/index.html 不存在。" >&2
  exit 1
fi

archive="$(mktemp -t wanghuanlab-release.XXXXXX).tar.gz"
remote_archive="/tmp/www.wanghuanlab.com-$(date +%s).tar.gz"
trap 'rm -f "$archive"' EXIT

tar -czf "$archive" -C release .

ssh -p "$SSH_PORT" "$SSH_TARGET" "mkdir -p '$REMOTE_PATH'"
scp -P "$SSH_PORT" "$archive" "$SSH_TARGET:$remote_archive"
ssh -p "$SSH_PORT" "$SSH_TARGET" \
  "find '$REMOTE_PATH' -mindepth 1 -maxdepth 1 -exec rm -rf -- {} + && tar -xzf '$remote_archive' -C '$REMOTE_PATH' && rm -f '$remote_archive'"

echo "发布完成：https://www.wanghuanlab.com/"
