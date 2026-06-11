#!/bin/bash

# 开发环境启动脚本 - 同时运行前后端

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo "🔧 开发模式启动..."

# 检查 node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 安装前端依赖..."
    npm install
fi

# 启动后端（后台）
echo "🐍 启动后端服务器..."
source .venv/bin/activate 2>/dev/null || python3 -m venv .venv && source .venv/bin/activate
python3 server.py > dev-backend.log 2>&1 &
BACKEND_PID=$!
echo "   后端 PID: $BACKEND_PID (日志: dev-backend.log)"

# 等待后端启动
sleep 2

# 启动前端开发服务器
echo "⚡ 启动前端开发服务器..."
echo "   前端: http://localhost:5173"
echo "   后端: http://localhost:8800"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

# 捕获退出信号，清理后端进程
trap "echo ''; echo '🛑 停止服务...'; kill $BACKEND_PID 2>/dev/null; exit" INT TERM

npm run dev

# 如果前端退出，也停止后端
kill $BACKEND_PID 2>/dev/null
