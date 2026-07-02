# 日语学习应用

一个本地运行的日语词汇和语法学习应用，包含间隔重复、错题复习、每日提醒和本地 SQLite 进度存储。

## 技术栈

- 后端：Python 3、SQLite、`ThreadingHTTPServer`
- 前端：React 19、TypeScript、Vite、Tailwind CSS、Lucide React
- 运行方式：后端监听 `127.0.0.1:8000`，Vite 开发服代理 `/api` 到后端

## 项目结构

```text
.
├── server.py                 # 后端服务器入口
├── seed_words.py             # 词汇种子数据，server.py 会直接 import
├── seed_grammar.py           # 语法种子数据，server.py 会直接 import
├── backend_selfcheck.py      # 数据库自检/初始化脚本
├── remind.py                 # 每日提醒脚本
├── src/                      # React/Vite 前端源码
├── static/                   # 后端可直接 serve 的静态资源
├── data/                     # 原始/辅助数据文件
├── tools/                    # 数据导入、合并、回填工具
├── scripts/                  # 通用启动、开发、备份、维护脚本
├── platform/macos/           # macOS .app、.command、launchd 配置
├── legacy/fallback-web/      # 旧版 fallback Web 资源
├── docs/                     # 辅助文档和历史状态说明
├── photo-homepage/           # 独立个人主页，不属于主学习应用
├── package.json
├── requirements.txt
└── vite.config.ts
```

## 本地数据库

`japanese_words.sqlite3` 是运行态数据库，包含本机学习进度，现在不再纳入 git。首次运行或需要重建时执行：

```bash
python3 backend_selfcheck.py
```

数据库、备份和日志都在 `.gitignore` 中忽略，避免学习/测试过程污染工作区。

## 安装与运行

### 1. 安装 Python 依赖

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. 安装 Node.js 依赖

```bash
npm install
```

### 3. 启动后端

```bash
python3 server.py
# http://127.0.0.1:8000
```

### 4. 启动前端开发服

```bash
npm run dev
# http://127.0.0.1:5173
```

也可以使用脚本：

```bash
scripts/start.sh       # 只启动后端
scripts/dev.sh         # 同时启动后端和 Vite
```

macOS 桌面入口和提醒配置在 `platform/macos/`。如果使用 launchd plist，需要按本机 clone 路径调整其中的 `cd "$HOME/Documents/master-nihongo-app"`。

## 数据来源

词库部分导入自 [eggrolls-JLPT10k-v3.5](https://github.com/5mdld/anki-jlpt-decks)。

- 许可：CC BY-NC 4.0
- 用途：非商业个人学习

## 维护

```bash
scripts/backup.sh
scripts/maintenance.sh
```

主要数据库表：`words`、`progress`、`reviews`、`grammar_points`、`grammar_progress`、`kanji_progress`。