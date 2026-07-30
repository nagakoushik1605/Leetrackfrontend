-- ============================================================================
-- LeetCode Tracker — Supabase schema
-- ============================================================================
-- Run this once in your Supabase project's SQL Editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run).
--
-- It creates:
--   1. public.profiles        one row per authenticated user
--   2. Row Level Security     so users can only ever read/write their own row
--   3. a trigger on auth.users so a profile row is created automatically
--      the moment someone signs up (no app-side "create profile" call needed)
-- ============================================================================

-- 1. Table -------------------------------------------------------------------

create table if not exists public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  email             text,
  leetcode_username text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- If `profiles` already existed from an earlier version of this schema,
-- `create table if not exists` above is a no-op and any new columns below
-- would silently be missing. These ALTERs backfill them safely either way.
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists leetcode_username text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

comment on table public.profiles is
  'One row per app user, linked 1:1 to auth.users. Stores the LeetCode '
  'username the account has chosen to track.';

-- 2. Row Level Security -------------------------------------------------------

alter table public.profiles enable row level security;

-- Users may only see their own row.
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Users may only create a row for themselves (the trigger below normally
-- does this automatically, but the policy exists in case the app ever
-- needs to upsert client-side).
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- Users may only update their own row.
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No delete policy is defined on purpose — profile rows are removed
-- automatically via `on delete cascade` when the auth.users row is deleted
-- (e.g. an admin deletes the account), not by the client directly.

-- 3. Keep updated_at fresh ----------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- 4. Auto-create a profile row on signup -------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 5. Public leaderboard function ----------------------------------------------
-- The leaderboard needs to list every signed-in user's LeetCode username,
-- but the RLS policies above (intentionally) only let a user read their own
-- profiles row. A plain view can still end up filtered by that same RLS
-- depending on how the view's owner/role is configured, which is why a
-- straight `select * from a view` sometimes only returned the calling
-- user's own row. A `security definer` function sidesteps this reliably: it
-- always executes with the function owner's read access to `profiles`,
-- regardless of who calls it, while only ever returning the one
-- non-sensitive column below (no email, no id).
create or replace function public.get_leaderboard_usernames()
returns table (leetcode_username text)
language sql
security definer
set search_path = public
as $$
  select p.leetcode_username
  from public.profiles p
  where p.leetcode_username is not null and p.leetcode_username <> '';
$$;

comment on function public.get_leaderboard_usernames() is
  'Public, read-only list of LeetCode usernames for every account that has '
  'signed in and set a username. Used to populate the in-app leaderboard '
  'with only registered users. Deliberately excludes email/id and runs as '
  'security definer so RLS on profiles never hides other users rows from it.';

grant execute on function public.get_leaderboard_usernames() to anon, authenticated;

-- Drop the older view-based approach if it exists from a previous version
-- of this schema, since the function above replaces it.
drop view if exists public.leaderboard_profiles;

-- ============================================================================
-- Done. Verify with:
--   select * from public.profiles;
--   select * from public.get_leaderboard_usernames();
-- ============================================================================
