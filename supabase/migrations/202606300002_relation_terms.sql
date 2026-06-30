create table if not exists public.idiom_relation_terms (
  id uuid primary key default gen_random_uuid(),
  title text not null unique check (length(trim(title)) > 0),
  key_pronunciations text,
  meaning text,
  source text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists idiom_relation_terms_set_updated_at on public.idiom_relation_terms;
create trigger idiom_relation_terms_set_updated_at
before update on public.idiom_relation_terms
for each row execute function public.set_updated_at();

alter table public.idiom_relation_terms enable row level security;

drop policy if exists "public_relation_terms_are_readable" on public.idiom_relation_terms;
create policy "public_relation_terms_are_readable" on public.idiom_relation_terms
for select to anon, authenticated using (is_published or public.is_admin());

drop policy if exists "admins_insert_relation_terms" on public.idiom_relation_terms;
create policy "admins_insert_relation_terms" on public.idiom_relation_terms
for insert to authenticated with check (public.is_admin());

drop policy if exists "admins_update_relation_terms" on public.idiom_relation_terms;
create policy "admins_update_relation_terms" on public.idiom_relation_terms
for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins_delete_relation_terms" on public.idiom_relation_terms;
create policy "admins_delete_relation_terms" on public.idiom_relation_terms
for delete to authenticated using (public.is_admin());

alter table public.idiom_relations
  add column if not exists target_term_id uuid references public.idiom_relation_terms(id) on delete cascade;

alter table public.idiom_relations
  alter column target_id drop not null;

alter table public.idiom_relations
  drop constraint if exists idiom_relations_no_self;

alter table public.idiom_relations
  add constraint idiom_relations_target_kind_check check (
    (target_id is not null and target_term_id is null and source_id <> target_id)
    or
    (target_id is null and target_term_id is not null)
  );

create unique index if not exists idiom_relations_unique_source_term_type
on public.idiom_relations (source_id, target_term_id, relation_type)
where target_term_id is not null;

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
    and (
      (
        target_id is not null
        and exists (
          select 1 from public.idioms target_idiom
          where target_idiom.id = idiom_relations.target_id
            and target_idiom.is_visible
        )
      )
      or
      (
        target_term_id is not null
        and exists (
          select 1 from public.idiom_relation_terms relation_term
          where relation_term.id = idiom_relations.target_term_id
            and relation_term.is_published
        )
      )
    )
  )
);

do $$
begin
  alter publication supabase_realtime add table public.idiom_relation_terms;
exception
  when duplicate_object then null;
end;
$$;
