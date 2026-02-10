# K-pop 回归预告机 - Web版

这是小程序版本的网站版本，功能完全一致。

## 功能特性

- 📅 日历视图显示活动日程
- 🔍 搜索功能（搜索团名/标题）
- 🏷️ 筛选功能（全部、回归、演唱会、签售、活动）
- ⭐ 收藏功能
- 📝 记录功能（记录当时心情）
- 📄 详情页面

## 技术栈

- React 18
- TypeScript
- Vite
- React Router

## 安装和运行

```bash
# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 配置

在 `src/utils/config.ts` 中配置 API 地址：

```typescript
export const SCHEDULE_API_BASE = 'https://your-domain.com';
```

如果留空，将使用本地示例数据。

## 项目结构

```
src/
├── pages/          # 页面组件
│   ├── Home.tsx    # 主页面（日历、搜索、筛选）
│   └── EventDetail.tsx  # 详情页面
├── utils/          # 工具函数
│   ├── api.ts      # API 请求
│   ├── calendar.ts # 日历相关
│   ├── config.ts   # 配置
│   ├── search.ts   # 搜索逻辑
│   └── storage.ts   # 本地存储
├── types/          # TypeScript 类型定义
└── App.tsx         # 应用入口
```

## 本地存储

应用使用 localStorage 存储以下数据：
- `my_favorites`: 收藏列表
- `my_records`: 记录列表
- `my_history`: 浏览历史

## 浏览器支持

支持所有现代浏览器（Chrome, Firefox, Safari, Edge）。
