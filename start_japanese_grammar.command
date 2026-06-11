#!/bin/zsh

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

if ! command -v npm >/dev/null 2>&1; then
  echo "没有找到 npm，切换到无需构建的静态模式。"
  echo "如果以后想运行 React/Vite 完整开发模式，请安装 Node.js: https://nodejs.org/"
  echo
  (sleep 2 && open "http://localhost:5173") &
  python3 -m http.server 5173 --bind 127.0.0.1
  exit 0
fi

if [ ! -d "node_modules" ]; then
  echo "第一次启动，正在安装依赖..."
  npm install
fi

PORT=5173
URL="http://localhost:${PORT}"

echo "正在启动 Japanese Grammar Trainer..."
echo "打开地址: ${URL}"

(sleep 2 && open "$URL") &

npm run dev -- --host 127.0.0.1 --port "$PORT"
