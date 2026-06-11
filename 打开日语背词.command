#!/bin/zsh

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR" || exit 1

PORT=8000
URL="http://127.0.0.1:${PORT}/"
LOG_FILE="$PROJECT_DIR/server.run.log"

if curl -fsS "http://127.0.0.1:${PORT}/api/stats" >/dev/null 2>&1; then
  echo "后端已经在运行，直接打开网页。"
  open "$URL"
  exit 0
fi

OLD_PID="$(lsof -ti tcp:${PORT} 2>/dev/null | head -n 1)"
if [ -n "$OLD_PID" ]; then
  echo "8000 端口被旧进程占用，先关闭它。"
  kill "$OLD_PID" 2>/dev/null
  sleep 1
fi

echo "正在启动日语背词后端..."
nohup python3 "$PROJECT_DIR/server.py" > "$LOG_FILE" 2>&1 &

for _ in {1..30}; do
  if curl -fsS "http://127.0.0.1:${PORT}/api/stats" >/dev/null 2>&1; then
    echo "启动成功，打开网页。"
    open "$URL"
    exit 0
  fi
  sleep 0.2
done

echo "启动失败，请查看日志：$LOG_FILE"
open "$PROJECT_DIR"
exit 1
