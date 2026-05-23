-- Bootstrap community hub for iGauchoBack
-- Replace YOUR_USER_UUID with your auth.users.id after first GitHub sign-in.

-- Promote to maintainer (can pin announcements)
insert into public.user_profiles (user_id, display_name, school_short_name, is_maintainer)
select id, coalesce(split_part(email, '@', 1), 'maintainer'), 'ucla', true
from auth.users
where id = 'YOUR_USER_UUID'
on conflict (user_id) do update set is_maintainer = true;

-- Seed pinned announcements (UCLA + UCSB)
insert into public.school_announcements (school_short_name, title, body, pinned, author_id)
values
  (
    'ucla',
    'Spring 2026 curriculum update',
    'EC ENGR 131A is now a prerequisite for EC ENGR 152B. See the Samueli Announcement PDF.',
    true,
    'YOUR_USER_UUID'
  ),
  (
    'ucsb',
    'Spring 2026 curriculum change',
    'ECE 130 is now a prerequisite for ECE 153 per the 25-26 GEAR update.',
    true,
    'YOUR_USER_UUID'
  );

-- Optional: seed a sample question
insert into public.community_questions (school_short_name, title, body, course_code, author_id, status)
values (
  'ucla',
  'Is COM SCI 35L really that hard?',
  'Heard mixed things about the projects and time commitment.',
  'COM SCI 35L',
  'YOUR_USER_UUID',
  'open'
);
