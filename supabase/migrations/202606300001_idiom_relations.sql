create table if not exists public.idiom_relations (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.idioms(id) on delete cascade,
  target_id uuid not null references public.idioms(id) on delete cascade,
  relation_type text not null check (relation_type in ('confusion', 'synonym', 'antonym', 'related')),
  comparison_note text not null check (length(trim(comparison_note)) > 0),
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint idiom_relations_no_self check (source_id <> target_id),
  constraint idiom_relations_unique_direct unique (source_id, target_id, relation_type)
);

create unique index if not exists idiom_relations_unique_pair_type
on public.idiom_relations (
  least(source_id, target_id),
  greatest(source_id, target_id),
  relation_type
);

create index if not exists idiom_relations_source_idx on public.idiom_relations (source_id, sort_order);
create index if not exists idiom_relations_target_idx on public.idiom_relations (target_id, sort_order);
create index if not exists idiom_relations_public_idx on public.idiom_relations (is_published, relation_type, sort_order);

drop trigger if exists idiom_relations_set_updated_at on public.idiom_relations;
create trigger idiom_relations_set_updated_at
before update on public.idiom_relations
for each row execute function public.set_updated_at();

alter table public.idiom_relations enable row level security;

drop policy if exists "public_relations_follow_visible_idioms" on public.idiom_relations;
create policy "public_relations_follow_visible_idioms" on public.idiom_relations
for select to anon, authenticated using (
  public.is_admin()
  or (
    is_published
    and exists (
      select 1 from public.idioms source_idiom
      where source_idiom.id = idiom_relations.source_id
        and source_idiom.is_visible
    )
    and exists (
      select 1 from public.idioms target_idiom
      where target_idiom.id = idiom_relations.target_id
        and target_idiom.is_visible
    )
  )
);

drop policy if exists "admins_insert_idiom_relations" on public.idiom_relations;
create policy "admins_insert_idiom_relations" on public.idiom_relations
for insert to authenticated with check (public.is_admin());

drop policy if exists "admins_update_idiom_relations" on public.idiom_relations;
create policy "admins_update_idiom_relations" on public.idiom_relations
for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins_delete_idiom_relations" on public.idiom_relations;
create policy "admins_delete_idiom_relations" on public.idiom_relations
for delete to authenticated using (public.is_admin());

do $$
begin
  alter publication supabase_realtime add table public.idiom_relations;
exception
  when duplicate_object then null;
end;
$$;

with pairs as (
  select
    source.id as source_id,
    target.id as target_id,
    seed.relation_type,
    seed.comparison_note,
    seed.sort_order
  from (values
    ('首当其冲', '身先士卒', 'confusion', '首当其冲强调最先受到冲击；身先士卒强调率先行动、带头做事。', 10),
    ('差强人意', '不尽如人意', 'confusion', '差强人意表示大体令人满意；不尽如人意表示不够令人满意。', 20),
    ('不孚众望', '不负众望', 'confusion', '不孚众望指不能使大家信服；不负众望指不辜负大家的期望。', 30),
    ('临渴掘井', '未雨绸缪', 'antonym', '临渴掘井指事到临头才想办法；未雨绸缪指事先做好防备。', 40)
  ) as seed(source_title, target_title, relation_type, comparison_note, sort_order)
  join public.idioms source on source.title = seed.source_title
  join public.idioms target on target.title = seed.target_title
)
insert into public.idiom_relations (
  source_id,
  target_id,
  relation_type,
  comparison_note,
  is_published,
  sort_order
)
select
  source_id,
  target_id,
  relation_type,
  comparison_note,
  true,
  sort_order
from pairs
on conflict ((least(source_id, target_id)), (greatest(source_id, target_id)), relation_type)
do update set
  comparison_note = excluded.comparison_note,
  is_published = excluded.is_published,
  sort_order = excluded.sort_order;
