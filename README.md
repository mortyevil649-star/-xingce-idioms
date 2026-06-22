# 行测成语积累

基于 React、TypeScript、Vite、Tailwind CSS、Supabase 和 Vercel 的成语学习网站。线上成语、公开例句和个人学习记录均以 Supabase 为准，管理员可直接在手机或电脑后台维护内容，无需修改代码或重新部署。

## 本地启动

```bash
npm install
npm run dev
```

生产构建使用 `npm run build`。

## 1. 创建 Supabase 项目

1. 登录 Supabase，新建项目并妥善保存数据库密码。
2. 在项目设置的 API 页面获取 Project URL 和 **Publishable key**。
3. 不要使用或复制 `service_role`、secret key、任何 `sb_secret_` 开头的密钥到本项目、浏览器或 Vercel 前端变量。

## 2. 运行 migration

migration 位于 `supabase/migrations/202606220001_initial_schema.sql`，包含表、索引、触发器、RLS 和 Realtime 配置。

使用 Supabase CLI：

```bash
supabase login
supabase link --project-ref 你的项目REF
supabase db push
```

也可以在 Supabase SQL Editor 中打开 migration 文件，完整执行一次。

## 3. 创建管理员账号

1. 在 Supabase Dashboard 打开 Authentication → Users。
2. 选择 Add user，填写管理员邮箱和密码。网站后台不提供注册入口。
3. 在 SQL Editor 执行：

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = '你的管理员邮箱'
);
```

如果用户创建后没有 profile，确认 migration 中的 `on_auth_user_created` 触发器已创建。

## 4. 配置本地环境变量

复制 `.env.example` 为 `.env.local`：

```dotenv
VITE_SUPABASE_URL=https://你的项目REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=你的_publishable_key
```

`.env.local` 已被 Git 忽略。只有运行历史导入脚本时，才在本机额外填写：

```dotenv
SUPABASE_ADMIN_EMAIL=你的管理员邮箱
SUPABASE_ADMIN_PASSWORD=你的管理员密码
```

管理员密码仅供本地导入脚本登录，绝不能提交 Git 或配置成 Vite/Vercel 客户端变量。

## 5. 导入历史成语

`src/data/idioms.ts` 仅作为历史备份，不再被线上页面引用。首次完成 migration 和管理员设置后执行：

```bash
npm run import:idioms
```

脚本检查重复 code、重复 title、缺少 title 和缺少 meaning；按 code 可重复 upsert，并重建公开例句。无法确认的可选字段保留“待人工核对”。结束时输出成功数和失败条目。

Excel 可以继续用于备份和批量整理，线上数据以 Supabase 为准。

## 6. 部署到 Vercel

1. 将仓库导入 Vercel，框架选择 Vite。
2. Build Command 使用 `npm run build`，Output Directory 使用 `dist`。
3. 在 Project Settings → Environment Variables 添加：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. 保存后在 Deployments 中选择 Redeploy。以后通过后台修改数据库内容不需要重新部署。

Vercel 只应保存这两个可公开到浏览器的 Vite 变量。不得填写数据库密码、管理员密码、service role、secret key 或 `sb_secret_` 密钥。

## 7. 使用后台

访问 `/admin/login`，用已升级为 admin 的账号登录。后台支持：

- 查看总数、展示数、隐藏数、高难度数和最近修改；
- 搜索及按分类、难度、展示状态筛选；
- 新增、编辑、删除、隐藏和恢复成语；
- 添加、删除并排序多个标准例句；
- 手机端直接维护所有标准字段。

前台通过 Supabase Realtime 自动接收内容变化。登录账号的收藏、状态、笔记、我的例句和复习日期也会跨设备同步。

## 常见问题

### 环境变量缺失

检查 `.env.local` 或 Vercel 环境变量名称，修改后重启本地服务或重新部署。

### 没有管理权限

账号已登录，但 `public.profiles.role` 不是 `admin`。使用 SQL Editor 按上面的 SQL 升级邮箱，退出后重新登录。

### RLS 拒绝写入

确认用户已登录、profile 存在且 role 为 admin，并确认 migration 已完整执行。不要关闭 RLS，也不要把 service role 放进前端绕过策略。

### 登录后看不到个人记录

确认学习记录表已加入 Realtime publication，检查浏览器控制台的 Supabase 请求错误。首次登录会尝试把旧 localStorage 学习数据迁移到当前账号。

## 安全边界

可以放在前端：Supabase Project URL、Publishable key。安全性由 RLS 保证。

绝对不能泄露：数据库密码、管理员密码、service role key、secret key、`sb_secret_` 开头的 key、个人访问令牌。

## 更新成语内容

公共成语内容的唯一来源是 `data/idioms.xlsx`。请编辑工作表 `Idioms_Data`：第 3 行是固定字段名，第 4 行开始是数据，不要改工作表名或表头所在行。

必须填写的列：

- `ID`：稳定且唯一，对应 Supabase `idioms.code`，已有成语不要随意修改。
- `成语`：不得重复或留空。
- `准确释义`：不得留空。
- `正确例句`：不得留空；多条例句用单元格内换行或 `||` 分隔。

其他支持字段包括重点字读音、易读错提示、主分类、标签、常见误用、适用对象、常见搭配、使用限制、难度、来源/备注、是否展示和排序编号。标签可用中英文逗号分隔；常见搭配可用换行或分号分隔。

`是否展示` 填“否”会把成语隐藏，但不会删除；填“是”或留空会展示。Excel 暂时缺少数据库中的某一行时，脚本不会自动删除或隐藏该成语。

### 本地同步环境变量

`.env.sync.local` 只保存在本机并已加入 `.gitignore`：

```dotenv
SUPABASE_URL=https://你的项目REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=你的_service_role_key
```

这两个变量只供本地同步脚本使用。`SUPABASE_SERVICE_ROLE_KEY` 绝不能上传 GitHub、放进 Vercel、写进前端代码或发送给他人。仓库中的 `.env.sync.example` 只保留空变量名。

### 只检查 Excel

```bash
npm run sync:idioms
```

该命令不会连接或写入数据库。发现重复 ID、重复成语、空白行、缺少成语、缺少释义、例句为空、难度或展示状态格式错误时，会列出具体 Excel 行号；先修正所有问题再同步。

### 正式同步

```bash
npm run sync
```

同步规则：新增 code 会插入，已有 code 内容变化会更新；“否”会隐藏；公共标准例句按 `idiom_id + content` 去重并与 Excel 保持一致。脚本不会读写 `user_idiom_study`、`user_idiom_examples` 或任何收藏、状态、个人笔记和复习日期。

完成后会输出新增、更新、隐藏、跳过、失败数量，以及 `idioms` 和 `idiom_examples` 当前总数。

成语同步后不需要重新部署 Vercel，网站会从 Supabase 自动读取并通过 Realtime 获取最新内容。只有修改网站功能、代码或样式时才需要提交 Git 并重新部署。
