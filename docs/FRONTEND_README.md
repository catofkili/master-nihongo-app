# Japanese Grammar Trainer

这是一个 React + Vite + TypeScript + Tailwind CSS 的本地前端应用，没有后端。

## 在 VS Code 里运行

1. 确认电脑已安装 Node.js，并且终端里可以运行：

```bash
node --version
npm --version
```

2. 在项目目录安装依赖：

```bash
npm install
```

3. 启动开发服务器：

```bash
npm run dev
```

4. 按终端提示打开本地地址，通常是：

```text
http://localhost:5173
```

## 数据位置

语法数据在 `src/data/grammar.ts`。

## 本地保存

学习进度、复习队列和错题本保存在浏览器 `localStorage`。换浏览器或清理浏览器数据后，进度会重置。
