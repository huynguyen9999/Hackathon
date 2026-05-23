-- AcadMap — Postgres schema (matches lib/types.ts)
-- Run in Supabase SQL editor.

create extension if not exists "pgcrypto";

-- ——— Tables ———

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text not null unique,
  location text,
  created_at timestamptz not null default now()
);

create table if not exists public.majors (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  name text not null,
  slug text not null,
  degree_type text,
  created_at timestamptz not null default now(),
  unique (school_id, slug)
);

create table if not exists public.roadmaps (
  id uuid primary key default gen_random_uuid(),
  major_id uuid not null references public.majors (id) on delete cascade,
  contributor_id uuid references auth.users (id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (major_id, version)
);

create table if not exists public.nodes (
  id uuid primary key default gen_random_uuid(),
  roadmap_id uuid not null references public.roadmaps (id) on delete cascade,
  external_id text,
  node_type text not null check (node_type in ('course', 'career', 'skill')),
  label text not null,
  title text,
  description text,
  units integer,
  self_learnable boolean not null default false,
  resources jsonb default '[]'::jsonb,
  position_x double precision not null default 0,
  position_y double precision not null default 0,
  metadata jsonb default '{}'::jsonb,
  unique (roadmap_id, external_id)
);

create table if not exists public.edges (
  id uuid primary key default gen_random_uuid(),
  roadmap_id uuid not null references public.roadmaps (id) on delete cascade,
  source_id uuid not null references public.nodes (id) on delete cascade,
  target_id uuid not null references public.nodes (id) on delete cascade,
  edge_type text not null default 'prerequisite'
    check (edge_type in ('prerequisite', 'recommended', 'leads_to')),
  label text
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  roadmap_id uuid not null references public.roadmaps (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  unique (roadmap_id, user_id)
);

-- ——— Indexes ———

create index if not exists idx_majors_school_id on public.majors (school_id);
create index if not exists idx_roadmaps_major_id on public.roadmaps (major_id);
create index if not exists idx_roadmaps_status on public.roadmaps (status);
create index if not exists idx_nodes_roadmap_id on public.nodes (roadmap_id);
create index if not exists idx_edges_roadmap_id on public.edges (roadmap_id);

-- ——— updated_at ———

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_roadmaps_updated_at on public.roadmaps;
create trigger trg_roadmaps_updated_at
before update on public.roadmaps
for each row execute function public.set_updated_at();

-- ——— Row Level Security ———

alter table public.schools enable row level security;
alter table public.majors enable row level security;
alter table public.roadmaps enable row level security;
alter table public.nodes enable row level security;
alter table public.edges enable row level security;
alter table public.votes enable row level security;

-- Schools & majors: public read
create policy "schools_select_public"
  on public.schools for select to anon, authenticated using (true);

create policy "majors_select_public"
  on public.majors for select to anon, authenticated using (true);

-- Roadmaps: public sees approved; contributors see own pending/rejected
create policy "roadmaps_select_approved"
  on public.roadmaps for select to anon, authenticated
  using (status = 'approved');

create policy "roadmaps_select_own"
  on public.roadmaps for select to authenticated
  using (contributor_id = auth.uid());

-- Nodes & edges: readable when parent roadmap is visible
create policy "nodes_select_visible"
  on public.nodes for select to anon, authenticated
  using (
    exists (
      select 1 from public.roadmaps r
      where r.id = nodes.roadmap_id
        and (r.status = 'approved' or r.contributor_id = auth.uid())
    )
  );

create policy "edges_select_visible"
  on public.edges for select to anon, authenticated
  using (
    exists (
      select 1 from public.roadmaps r
      where r.id = edges.roadmap_id
        and (r.status = 'approved' or r.contributor_id = auth.uid())
    )
  );

-- Authenticated inserts (contributions)
create policy "schools_insert_authenticated"
  on public.schools for insert to authenticated with check (true);

create policy "majors_insert_authenticated"
  on public.majors for insert to authenticated with check (true);

create policy "roadmaps_insert_authenticated"
  on public.roadmaps for insert to authenticated
  with check (contributor_id = auth.uid());

create policy "nodes_insert_authenticated"
  on public.nodes for insert to authenticated with check (true);

create policy "edges_insert_authenticated"
  on public.edges for insert to authenticated with check (true);

create policy "votes_select_public"
  on public.votes for select to anon, authenticated using (true);

create policy "votes_insert_own"
  on public.votes for insert to authenticated
  with check (auth.uid() = user_id);

create policy "votes_delete_own"
  on public.votes for delete to authenticated
  using (auth.uid() = user_id);
