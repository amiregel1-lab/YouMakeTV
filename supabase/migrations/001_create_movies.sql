-- YouMakeTV — movies table
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).

-- ── Table ─────────────────────────────────────────────────────────────────────
create table if not exists public.movies (
  id                         integer      primary key,
  title                      text         not null,
  subtitle                   text,
  description                text,
  genre                      text,
  genres                     text[],
  duration                   text,          -- runtime, e.g. "1h 38m"
  creator_name               text,
  price                      numeric(10,2) default 0,
  cover_url                  text,          -- Supabase Storage public URL or external URL
  trailer_url                text,          -- Supabase Storage public URL or /trailers/... path
  badge                      text,
  tools                      text[],
  rating                     text,
  language                   text,
  tags                       text[],
  release_year               integer,
  views                      integer       default 0,
  trailer_views              integer       default 0,
  featured                   boolean       default false,
  subscriber_discount_eligible boolean     default false,
  poster_prompt              text,
  status                     text          default 'Approved',
  created_at                 timestamptz   default now(),
  updated_at                 timestamptz   default now()
);

-- ── Row Level Security ────────────────────────────────────────────────────────
alter table public.movies enable row level security;

-- Anyone can read movies (viewer homepage, detail pages)
create policy "Public read"
  on public.movies for select
  using (true);

-- Anon key can insert (seeding on first load) and update (admin edits)
-- NOTE: in production, lock these down to a server-side service-role key.
create policy "Anon insert"
  on public.movies for insert
  with check (true);

create policy "Anon update"
  on public.movies for update
  using (true);

-- ── Storage bucket policy helpers ────────────────────────────────────────────
-- The `covers` and `trailers` buckets must exist and be set to public.
-- Run these if the buckets were created without public access:

-- update storage.buckets set public = true where id = 'covers';
-- update storage.buckets set public = true where id = 'trailers';

-- Allow anon uploads to both buckets:
-- create policy "Anon covers upload"
--   on storage.objects for insert
--   with check (bucket_id = 'covers');
--
-- create policy "Anon trailers upload"
--   on storage.objects for insert
--   with check (bucket_id = 'trailers');

-- ── Auto-update updated_at ────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists movies_updated_at on public.movies;
create trigger movies_updated_at
  before update on public.movies
  for each row execute procedure public.set_updated_at();
