# 项目维护说明

## 数据源

线上唯一数据源是 Supabase。`src/data/idioms.ts` 和 Excel 只作历史备份及首次导入，不得再被前台主逻辑引用。

## 主要结构

- `supabase/migrations/`：数据库 schema、RLS、触发器和 Realtime。
- `src/lib/supabase.ts`：仅使用 URL 与 publishable key 的浏览器客户端。
- `src/hooks/useIdioms.ts`：公开或管理员成语查询与 Realtime。
- `src/contexts/`：Auth 会话、管理员角色和个人学习数据。
- `src/pages/admin/`：管理员登录、管理列表和编辑表单。
- `scripts/import-idioms.ts`：历史备份可重复导入。

## 安全规则

所有 public 表必须保持 RLS 开启。管理写入必须经过 `is_admin()` 策略，个人数据必须限制 `auth.uid() = user_id`。不要把路径隐藏当成权限控制。

禁止把 service role、secret key、`sb_secret_`、数据库密码或管理员密码写入源码、README、Vercel 客户端环境变量或 Git。环境变量示例只能使用占位值。

修改数据库结构时新增 migration，不要改写已经在线执行过的 migration。完成后运行 `npm run build`。
