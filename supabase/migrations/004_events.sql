-- YouMakeTV — analytics events table
-- Stores one row per measurable user action (trailer play, purchase, sign-up,
-- subscription, movie view) so the admin "Today" dashboard can count what
-- actually happened today instead of estimating.
--
-- SECURITY: RLS is enabled with NO anon policies — the public anon key (bundled
-- in the client) can neither read nor write this table. All access goes through
-- the server-side /api/track function, which uses the SERVICE_ROLE key and so
-- bypasses RLS. This keeps event ingestion consistent with migration 003.
--
-- Run in: Supabase Dashboard → SQL Editor → New query.
-- Then add SUPABASE_SERVICE_ROLE_KEY to your Vercel environment variables
-- (Project → Settings → Environment Variables). VITE_SUPABASE_URL is reused
-- by the function for the project URL.

create table if not exists public.events (
  id          bigint generated always as identity primary key,
  type        text        not null check (type in (
                'trailer_play', 'purchase', 'signup', 'subscription', 'movie_view'
              )),
  movie_id    integer,
  title       text,
  created_at  timestamptz not null default now()
);

-- Fast "what happened since <timestamp>" lookups for the daily dashboard.
create index if not exists events_created_at_idx on public.events (created_at);
create index if not exists events_type_created_idx on public.events (type, created_at);

alter table public.events enable row level security;
-- Intentionally no policies: only the service_role key (server-side) may touch this.
