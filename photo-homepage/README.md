# 个人摄影主页

这是一个独立的本地静态网页，不会影响上一级目录里的日语学习应用。

## 怎么打开

直接双击 `index.html`，或者用浏览器打开这个文件。

## 怎么换成自己的照片

1. 把照片放进 `assets/photos` 文件夹。
2. 打开 `script.js`。
3. 找到 `photos` 数组。
4. 把某一项里的 `src: ""` 改成照片路径，例如：

```js
src: "./assets/photos/street-01.jpg"
```

标题、分类、地点年份也都可以在同一项里改。

## 建议

照片文件名尽量用英文、数字和横线，比如：

```text
street-01.jpg
mountain-light.jpg
```

这样路径不容易写错。
