create extension if not exists pgcrypto;

create type public.profile_role as enum ('user', 'admin');
create type public.study_status as enum ('未学', '已掌握', '易错');
create type public.idiom_difficulty as enum ('基础', '进阶', '高频易错');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.profile_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.idioms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (length(trim(code)) > 0),
  title text not null unique check (length(trim(title)) > 0),
  key_pronunciations text,
  pronunciation_note text,
  category text not null default '其他',
  tags text[] not null default '{}',
  meaning text not null check (length(trim(meaning)) > 0),
  common_mistake text,
  applicable_objects text,
  common_collocations text[] not null default '{}',
  usage_restrictions text,
  difficulty public.idiom_difficulty not null default '基础',
  source text,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idioms_visible_sort_idx on public.idioms (is_visible, sort_order, created_at);

create table public.idiom_examples (
  id uuid primary key default gen_random_uuid(),
  idiom_id uuid not null references public.idioms(id) on delete cascade,
  content text not null check (length(trim(content)) > 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idiom_examples_idiom_sort_idx on public.idiom_examples (idiom_id, sort_order);

create table public.user_idiom_study (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  idiom_id uuid not null references public.idioms(id) on delete cascade,
  status public.study_status not null default '未学',
  is_favorite boolean not null default false,
  personal_note text not null default '',
  personal_mistake_reminder text not null default '',
  next_review date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, idiom_id)
);

create index user_idiom_study_user_idx on public.user_idiom_study (user_id, idiom_id);

create table public.user_idiom_examples (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  idiom_id uuid not null references public.idioms(id) on delete cascade,
  content text not null check (length(trim(content)) > 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index user_idiom_examples_user_idiom_idx on public.user_idiom_examples (user_id, idiom_id, sort_order);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger idioms_set_updated_at before update on public.idioms for each row execute function public.set_updated_at();
create trigger idiom_examples_set_updated_at before update on public.idiom_examples for each row execute function public.set_updated_at();
create trigger user_idiom_study_set_updated_at before update on public.user_idiom_study for each row execute function public.set_updated_at();
create trigger user_idiom_examples_set_updated_at before update on public.user_idiom_examples for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role) values (new.id, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.idioms enable row level security;
alter table public.idiom_examples enable row level security;
alter table public.user_idiom_study enable row level security;
alter table public.user_idiom_examples enable row level security;

create policy "profiles_select_self_or_admin" on public.profiles
for select to authenticated using ((select auth.uid()) = id or public.is_admin());

create policy "visible_idioms_are_public" on public.idioms
for select to anon, authenticated using (is_visible or public.is_admin());
create policy "admins_insert_idioms" on public.idioms
for insert to authenticated with check (public.is_admin());
create policy "admins_update_idioms" on public.idioms
for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins_delete_idioms" on public.idioms
for delete to authenticated using (public.is_admin());

create policy "public_examples_follow_visible_idioms" on public.idiom_examples
for select to anon, authenticated using (
  public.is_admin() or exists (
    select 1 from public.idioms where idioms.id = idiom_examples.idiom_id and idioms.is_visible
  )
);
create policy "admins_insert_public_examples" on public.idiom_examples
for insert to authenticated with check (public.is_admin());
create policy "admins_update_public_examples" on public.idiom_examples
for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins_delete_public_examples" on public.idiom_examples
for delete to authenticated using (public.is_admin());

create policy "users_select_own_study" on public.user_idiom_study
for select to authenticated using ((select auth.uid()) = user_id);
create policy "users_insert_own_study" on public.user_idiom_study
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users_update_own_study" on public.user_idiom_study
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users_delete_own_study" on public.user_idiom_study
for delete to authenticated using ((select auth.uid()) = user_id);

create policy "users_select_own_examples" on public.user_idiom_examples
for select to authenticated using ((select auth.uid()) = user_id);
create policy "users_insert_own_examples" on public.user_idiom_examples
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users_update_own_examples" on public.user_idiom_examples
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users_delete_own_examples" on public.user_idiom_examples
for delete to authenticated using ((select auth.uid()) = user_id);

alter publication supabase_realtime add table public.idioms;
alter publication supabase_realtime add table public.idiom_examples;
alter publication supabase_realtime add table public.user_idiom_study;
alter publication supabase_realtime add table public.user_idiom_examples;

-- 手动将自己的 Auth 账号升级为管理员（在 Supabase SQL Editor 执行，并替换邮箱）：
-- update public.profiles
-- set role = 'admin'
-- where id = (select id from auth.users where email = 'your-admin@example.com');
