#!/bin/bash

# 日语学习应用 - 快速启动脚本

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo "🚀 启动日语学习应用..."

# 检查虚拟环境
if [ ! -d ".venv" ]; then
    echo "⚠️  未找到虚拟环境，正在创建..."
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
else
    source .venv/bin/activate
fi

# 检查数据库
if [ ! -f "japanese_words.sqlite3" ]; then
    echo "⚠️  未找到数据库，正在初始化..."
    python3 backend_selfcheck.py
fi

# 启动服务器
echo "✅ 启动服务器在 http://localhost:8800"
echo "   按 Ctrl+C 停止服务器"
echo ""

python3 server.py
