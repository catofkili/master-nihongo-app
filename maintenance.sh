#!/bin/bash

# 项目维护脚本

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo "🧹 项目维护任务"
echo ""

# 1. 清理旧的备份文件
if [ -d "archive_backups" ]; then
    BACKUP_SIZE=$(du -sh archive_backups | cut -f1)
    echo "📦 备份文件夹大小: $BACKUP_SIZE"
    read -p "   是否删除 archive_backups/ ? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf archive_backups/
        echo "   ✅ 已删除备份文件夹"
    fi
fi

# 2. 清理 Python 缓存
echo ""
echo "🐍 清理 Python 缓存..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -type f -name "*.pyc" -delete 2>/dev/null || true
echo "   ✅ Python 缓存已清理"

# 3. 清理日志文件
echo ""
echo "📝 清理日志文件..."
rm -f *.log *.err test-*.log test-*.err dev-*.log 2>/dev/null || true
echo "   ✅ 日志文件已清理"

# 4. 清理 .DS_Store
echo ""
echo "🍎 清理 macOS 系统文件..."
find . -name ".DS_Store" -delete 2>/dev/null || true
echo "   ✅ .DS_Store 文件已清理"

# 5. 数据库状态
echo ""
if [ -f "japanese_words.sqlite3" ]; then
    DB_SIZE=$(du -sh japanese_words.sqlite3 | cut -f1)
    echo "💾 数据库大小: $DB_SIZE"

    # 统计单词数量
    WORD_COUNT=$(python3 -c "import sqlite3; conn = sqlite3.connect('japanese_words.sqlite3'); print(conn.execute('SELECT COUNT(*) FROM words').fetchone()[0])" 2>/dev/null || echo "未知")
    echo "   单词数量: $WORD_COUNT"

    GRAMMAR_COUNT=$(python3 -c "import sqlite3; conn = sqlite3.connect('japanese_words.sqlite3'); print(conn.execute('SELECT COUNT(*) FROM grammar_points').fetchone()[0])" 2>/dev/null || echo "未知")
    echo "   语法点数量: $GRAMMAR_COUNT"
fi

# 6. 项目总大小
echo ""
PROJECT_SIZE=$(du -sh . | cut -f1)
echo "📊 项目总大小: $PROJECT_SIZE"

# 7. Git 状态
echo ""
echo "📋 Git 状态:"
if [ -d ".git" ]; then
    UNTRACKED=$(git status --short | grep "^??" | wc -l | xargs)
    MODIFIED=$(git status --short | grep "^ M" | wc -l | xargs)
    ADDED=$(git status --short | grep "^A " | wc -l | xargs)

    echo "   未跟踪文件: $UNTRACKED"
    echo "   修改的文件: $MODIFIED"
    echo "   待提交文件: $ADDED"
fi

echo ""
echo "✨ 维护完成！"
