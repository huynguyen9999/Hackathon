-- iGauchoBack — Postgres schema (matches lib/types.ts)
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

-- ——— Planner collaboration tables ———

create table if not exists public.planner_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.planner_plans (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  school_short_name text not null,
  major_slug text not null,
  roadmap_id text,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.planner_plan_members (
  plan_id uuid not null references public.planner_plans (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'advisor', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (plan_id, user_id)
);

create table if not exists public.planner_plan_versions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.planner_plans (id) on delete cascade,
  version integer not null,
  notes text,
  created_by uuid not null references auth.users (id) on delete cascade,
  audit_snapshot jsonb default '{}'::jsonb,
  validation_issues jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (plan_id, version)
);

create table if not exists public.planner_course_states (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.planner_plan_versions (id) on delete cascade,
  node_id text not null,
  status text not null check (status in ('planned', 'completed')),
  year smallint,
  quarter text check (quarter in ('Fall', 'Winter')),
  source text check (source in ('manual', 'ap', 'transfer')),
  created_at timestamptz not null default now()
);

create table if not exists public.planner_external_credits (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.planner_plan_versions (id) on delete cascade,
  credit_id text not null,
  type text not null check (type in ('ap', 'transfer')),
  exam_or_course text not null,
  score_or_grade text,
  mapped_node_ids text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  unique (version_id, credit_id)
);

create table if not exists public.planner_share_tokens (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.planner_plans (id) on delete cascade,
  token text not null unique,
  role text not null check (role in ('advisor', 'viewer')),
  created_by uuid not null references auth.users (id) on delete cascade,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.planner_comments (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.planner_plans (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_planner_plans_owner on public.planner_plans (owner_id);
create index if not exists idx_planner_versions_plan on public.planner_plan_versions (plan_id, version desc);
create index if not exists idx_planner_members_user on public.planner_plan_members (user_id);
create index if not exists idx_planner_comments_plan on public.planner_comments (plan_id, created_at);

alter table public.planner_profiles enable row level security;
alter table public.planner_plans enable row level security;
alter table public.planner_plan_members enable row level security;
alter table public.planner_plan_versions enable row level security;
alter table public.planner_course_states enable row level security;
alter table public.planner_external_credits enable row level security;
alter table public.planner_share_tokens enable row level security;
alter table public.planner_comments enable row level security;

create policy "planner_profiles_self_select"
  on public.planner_profiles for select to authenticated
  using (user_id = auth.uid());

create policy "planner_profiles_self_upsert"
  on public.planner_profiles for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "planner_plans_member_select"
  on public.planner_plans for select to authenticated
  using (
    exists (
      select 1 from public.planner_plan_members m
      where m.plan_id = planner_plans.id
        and m.user_id = auth.uid()
    )
  );

create policy "planner_plans_owner_insert"
  on public.planner_plans for insert to authenticated
  with check (owner_id = auth.uid());

create policy "planner_plans_member_update"
  on public.planner_plans for update to authenticated
  using (
    exists (
      select 1 from public.planner_plan_members m
      where m.plan_id = planner_plans.id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'advisor')
    )
  );

create policy "planner_members_member_select"
  on public.planner_plan_members for select to authenticated
  using (
    exists (
      select 1 from public.planner_plan_members m
      where m.plan_id = planner_plan_members.plan_id
        and m.user_id = auth.uid()
    )
  );

create policy "planner_members_owner_manage"
  on public.planner_plan_members for all to authenticated
  using (
    exists (
      select 1 from public.planner_plan_members m
      where m.plan_id = planner_plan_members.plan_id
        and m.user_id = auth.uid()
        and m.role = 'owner'
    )
  )
  with check (
    exists (
      select 1 from public.planner_plan_members m
      where m.plan_id = planner_plan_members.plan_id
        and m.user_id = auth.uid()
        and m.role = 'owner'
    )
  );

create policy "planner_versions_member_select"
  on public.planner_plan_versions for select to authenticated
  using (
    exists (
      select 1 from public.planner_plan_members m
      where m.plan_id = planner_plan_versions.plan_id
        and m.user_id = auth.uid()
    )
  );

create policy "planner_versions_editor_insert"
  on public.planner_plan_versions for insert to authenticated
  with check (
    exists (
      select 1 from public.planner_plan_members m
      where m.plan_id = planner_plan_versions.plan_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'advisor')
    )
  );

create policy "planner_course_states_member_select"
  on public.planner_course_states for select to authenticated
  using (
    exists (
      select 1
      from public.planner_plan_versions v
      join public.planner_plan_members m on m.plan_id = v.plan_id
      where v.id = planner_course_states.version_id
        and m.user_id = auth.uid()
    )
  );

create policy "planner_course_states_editor_insert"
  on public.planner_course_states for insert to authenticated
  with check (
    exists (
      select 1
      from public.planner_plan_versions v
      join public.planner_plan_members m on m.plan_id = v.plan_id
      where v.id = planner_course_states.version_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'advisor')
    )
  );

create policy "planner_external_credits_member_select"
  on public.planner_external_credits for select to authenticated
  using (
    exists (
      select 1
      from public.planner_plan_versions v
      join public.planner_plan_members m on m.plan_id = v.plan_id
      where v.id = planner_external_credits.version_id
        and m.user_id = auth.uid()
    )
  );

create policy "planner_external_credits_editor_insert"
  on public.planner_external_credits for insert to authenticated
  with check (
    exists (
      select 1
      from public.planner_plan_versions v
      join public.planner_plan_members m on m.plan_id = v.plan_id
      where v.id = planner_external_credits.version_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'advisor')
    )
  );

create policy "planner_share_tokens_member_select"
  on public.planner_share_tokens for select to authenticated
  using (
    exists (
      select 1 from public.planner_plan_members m
      where m.plan_id = planner_share_tokens.plan_id
        and m.user_id = auth.uid()
    )
  );

create policy "planner_share_tokens_owner_insert"
  on public.planner_share_tokens for insert to authenticated
  with check (
    exists (
      select 1 from public.planner_plan_members m
      where m.plan_id = planner_share_tokens.plan_id
        and m.user_id = auth.uid()
        and m.role = 'owner'
    )
  );

create policy "planner_comments_member_select"
  on public.planner_comments for select to authenticated
  using (
    exists (
      select 1 from public.planner_plan_members m
      where m.plan_id = planner_comments.plan_id
        and m.user_id = auth.uid()
    )
  );

create policy "planner_comments_member_insert"
  on public.planner_comments for insert to authenticated
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.planner_plan_members m
      where m.plan_id = planner_comments.plan_id
        and m.user_id = auth.uid()
    )
  );

create or replace function public.accept_planner_share_token(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan_id uuid;
  v_role text;
  v_user_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    return null;
  end if;

  select plan_id, role
  into v_plan_id, v_role
  from public.planner_share_tokens
  where token = p_token
    and (expires_at is null or expires_at > now())
  limit 1;

  if v_plan_id is null then
    return null;
  end if;

  insert into public.planner_plan_members (plan_id, user_id, role)
  values (v_plan_id, v_user_id, v_role)
  on conflict (plan_id, user_id)
  do update set role = excluded.role;

  return v_plan_id;
end;
$$;

grant execute on function public.accept_planner_share_token(text) to authenticated;
-- iGauchoBack — Community hub tables (migration 002)
-- Run in Supabase SQL editor after schema.sql

-- ——— User profiles (community) ———

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  school_short_name text,
  avatar_url text,
  verified_at timestamptz,
  is_maintainer boolean not null default false,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ——— Community Q&A ———

create table if not exists public.community_questions (
  id uuid primary key default gen_random_uuid(),
  school_short_name text not null,
  course_code text,
  major_slug text,
  title text not null,
  body text not null,
  author_id uuid references auth.users (id) on delete set null,
  status text not null default 'open'
    check (status in ('open', 'closed', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.community_questions (id) on delete cascade,
  body text not null,
  author_id uuid references auth.users (id) on delete set null,
  is_verified_student boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.answer_votes (
  id uuid primary key default gen_random_uuid(),
  answer_id uuid not null references public.community_answers (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  unique (answer_id, user_id)
);

-- ——— School announcements ———

create table if not exists public.school_announcements (
  id uuid primary key default gen_random_uuid(),
  school_short_name text not null,
  title text not null,
  body text not null,
  pinned boolean not null default false,
  author_id uuid references auth.users (id) on delete set null,
  effective_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ——— Course reviews ———

create table if not exists public.course_reviews (
  id uuid primary key default gen_random_uuid(),
  school_short_name text not null,
  course_code text not null,
  rating smallint not null check (rating between 1 and 5),
  difficulty smallint not null check (difficulty between 1 and 5),
  body text,
  author_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (school_short_name, course_code, author_id)
);

-- ——— Alumni outcomes ———

create table if not exists public.alumni_outcomes (
  id uuid primary key default gen_random_uuid(),
  school_short_name text not null,
  major_slug text,
  role text not null,
  company text,
  grad_year smallint,
  body text,
  author_id uuid references auth.users (id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

-- ——— Indexes ———

create index if not exists idx_community_questions_school
  on public.community_questions (school_short_name, created_at desc);

create index if not exists idx_community_answers_question
  on public.community_answers (question_id);

create index if not exists idx_answer_votes_answer
  on public.answer_votes (answer_id);

create index if not exists idx_school_announcements_school
  on public.school_announcements (school_short_name, pinned desc, created_at desc);

create index if not exists idx_course_reviews_school
  on public.course_reviews (school_short_name, course_code);

create index if not exists idx_alumni_outcomes_school
  on public.alumni_outcomes (school_short_name, status);

-- ——— updated_at triggers ———

drop trigger if exists trg_user_profiles_updated_at on public.user_profiles;
create trigger trg_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_community_questions_updated_at on public.community_questions;
create trigger trg_community_questions_updated_at
before update on public.community_questions
for each row execute function public.set_updated_at();

drop trigger if exists trg_community_answers_updated_at on public.community_answers;
create trigger trg_community_answers_updated_at
before update on public.community_answers
for each row execute function public.set_updated_at();

drop trigger if exists trg_school_announcements_updated_at on public.school_announcements;
create trigger trg_school_announcements_updated_at
before update on public.school_announcements
for each row execute function public.set_updated_at();

-- ——— Row Level Security ———

alter table public.user_profiles enable row level security;
alter table public.community_questions enable row level security;
alter table public.community_answers enable row level security;
alter table public.answer_votes enable row level security;
alter table public.school_announcements enable row level security;
alter table public.course_reviews enable row level security;
alter table public.alumni_outcomes enable row level security;

-- Profiles: public read; self write
create policy "user_profiles_select_public"
  on public.user_profiles for select to anon, authenticated using (true);

create policy "user_profiles_upsert_self"
  on public.user_profiles for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Questions: public read open; auth insert own
create policy "community_questions_select_public"
  on public.community_questions for select to anon, authenticated
  using (status = 'open');

create policy "community_questions_insert_auth"
  on public.community_questions for insert to authenticated
  with check (author_id = auth.uid());

create policy "community_questions_update_own"
  on public.community_questions for update to authenticated
  using (author_id = auth.uid());

-- Answers: public read; auth insert own
create policy "community_answers_select_public"
  on public.community_answers for select to anon, authenticated using (true);

create policy "community_answers_insert_auth"
  on public.community_answers for insert to authenticated
  with check (author_id = auth.uid());

-- Answer votes
create policy "answer_votes_select_public"
  on public.answer_votes for select to anon, authenticated using (true);

create policy "answer_votes_insert_own"
  on public.answer_votes for insert to authenticated
  with check (user_id = auth.uid());

create policy "answer_votes_delete_own"
  on public.answer_votes for delete to authenticated
  using (user_id = auth.uid());

-- Announcements: public read; maintainers insert/update
create policy "school_announcements_select_public"
  on public.school_announcements for select to anon, authenticated using (true);

create policy "school_announcements_maintainer_insert"
  on public.school_announcements for insert to authenticated
  with check (
    exists (
      select 1 from public.user_profiles p
      where p.user_id = auth.uid() and p.is_maintainer = true
    )
  );

create policy "school_announcements_maintainer_update"
  on public.school_announcements for update to authenticated
  using (
    exists (
      select 1 from public.user_profiles p
      where p.user_id = auth.uid() and p.is_maintainer = true
    )
  );

-- Course reviews: public read; auth insert own
create policy "course_reviews_select_public"
  on public.course_reviews for select to anon, authenticated using (true);

create policy "course_reviews_insert_own"
  on public.course_reviews for insert to authenticated
  with check (author_id = auth.uid());

-- Alumni outcomes: public read approved; auth insert
create policy "alumni_outcomes_select_approved"
  on public.alumni_outcomes for select to anon, authenticated
  using (status = 'approved');

create policy "alumni_outcomes_insert_auth"
  on public.alumni_outcomes for insert to authenticated
  with check (author_id = auth.uid());

create policy "alumni_outcomes_maintainer_update"
  on public.alumni_outcomes for update to authenticated
  using (
    exists (
      select 1 from public.user_profiles p
      where p.user_id = auth.uid() and p.is_maintainer = true
    )
  );
