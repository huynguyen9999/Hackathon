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
