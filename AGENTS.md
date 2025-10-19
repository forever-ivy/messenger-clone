# 仓库指引

## 项目结构与模块划分
- Next.js App Router 页面位于 `app/`，其中 `app/actions`、`app/api` 保存服务器动作与接口。
- 复用 UI 组件放在 `components/`（基础原子）与 `app/components/`（认证相关），上下文与自定义 Hook 分别位于 `app/context`、`app/hooks`。
- 数据库 schema 位于 `prisma/schema.prisma`，生成的 Prisma Client 输出到 `app/generated/prisma`。静态资产统一放在 `public/`。
- 新的复用组件优先放入 `components/`，页面专属片段置于对应的 `app/.../components` 目录。

## 构建、测试与开发命令
- `npm run dev` — 启动本地开发服务器（端口 3000），依赖 `.env` 提供 OAuth 配置。
- `npm run lint` — 运行 Next.js 集成的 ESLint 检查，提交前必须通过。
- `npm run build` — 生成生产构建并验证路由元数据。
- `npm run start` — 使用构建产物进行本地预览，常在 `npm run build` 后做冒烟测试。
- `npx prisma migrate dev` — 同步 MongoDB schema 并重新生成 Prisma Client。

## 编码风格与命名约定
- 统一使用 TypeScript 函数组件，优先采用 async/await 与 Tailwind 工具类。
- 缩进为两个空格；格式化由 ESLint/Prettier 自动处理，请勿手动对齐。
- 组件与 Hook 文件名使用 PascalCase（如 `Avatar.tsx`、`useConversation.ts`），服务器动作文件采用 camelCase。
- 条件样式使用 `clsx`；代码与注释默认使用 ASCII。

## 测试指引
- 当前暂无正式测试套件；若新增测试，置于目标文件旁（示例：`Component.test.tsx`），推荐使用 React Testing Library。
- 在提交前至少运行 `npm run lint`，并手动验证 `/users`、`/conversations`、OAuth 登录等关键流程。

## 提交与 PR 要求
- 沿用仓库已有的简洁祈使句式提交信息（示例：`add cloudinary`、`chat page`），相关改动尽量同一提交内完成。
- PR 需概括用户可见的变更，列出环境变量/数据库迁移步骤，并为 UI 调整附上截图或 GIF。
- 关联相关 issue，并标注后续待办事项。

## 安全与配置提示
- 必填环境变量包括 `DATABASE_URL`、`NEXTAUTH_SECRET`、`NEXTAUTH_URL` 及 OAuth 提供商证书。
- `.env` 文件严禁入库；新增变量时请更新 `README.md`。
- 如需引入新的图片域名，记得更新 `next.config.mjs` 的 `images.remotePatterns`。
