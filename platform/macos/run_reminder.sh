#!/bin/zsh

PROJECT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$PROJECT_DIR" || exit 1

PYTHON_BIN="${PYTHON_BIN:-/opt/homebrew/bin/python3}"
if [ ! -x "$PYTHON_BIN" ]; then
  PYTHON_BIN="$(command -v python3)"
fi

exec "$PYTHON_BIN" "$PROJECT_DIR/remind.py"