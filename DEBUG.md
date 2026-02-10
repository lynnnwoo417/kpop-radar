# 调试指南 - 空白页问题

如果网站显示空白页，请按以下步骤排查：

## 1. 确保依赖已安装

```bash
cd /Users/qixuan/kpop-schedule-web
npm install
```

## 2. 启动开发服务器

```bash
npm run dev
```

服务器启动后，会显示类似：
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## 3. 检查浏览器控制台

打开浏览器开发者工具（F12 或 Cmd+Option+I），查看 Console 标签页是否有错误信息。

常见错误：
- **模块未找到**：需要运行 `npm install`
- **路由错误**：检查 URL 是否正确
- **类型错误**：检查 TypeScript 编译是否通过

## 4. 检查网络请求

在浏览器开发者工具的 Network 标签页中，检查是否有请求失败（红色状态码）。

## 5. 检查元素

在 Elements/Inspector 标签页中，检查 `<div id="root">` 是否有内容。如果 root 是空的，说明 React 没有正确渲染。

## 6. 常见问题解决

### 问题：npm 命令不存在
**解决**：需要先安装 Node.js 和 npm
- 访问 https://nodejs.org/ 下载安装

### 问题：端口被占用
**解决**：使用其他端口
```bash
npm run dev -- --port 3000
```

### 问题：依赖安装失败
**解决**：清除缓存后重新安装
```bash
rm -rf node_modules package-lock.json
npm install
```

## 7. 验证代码

运行类型检查：
```bash
npm run build
```

如果构建成功，说明代码没有问题。

## 8. 如果仍然空白

请检查：
1. 浏览器是否支持现代 JavaScript（Chrome、Firefox、Safari、Edge 最新版本）
2. 是否禁用了 JavaScript
3. 是否有浏览器扩展阻止了页面加载

## 联系支持

如果以上步骤都无法解决问题，请提供：
- 浏览器控制台的错误信息
- 浏览器版本
- 操作系统版本
- 运行 `npm run dev` 的输出
