-- YouMakeTV — RLS hardening
-- ⚠️ SECURITY: migration 001 granted the PUBLIC anon key INSERT and UPDATE on
-- public.movies (`with check (true)` / `using (true)`). The anon key is bundled
-- into the client JS and is fully public, so today *anyone* can insert rows or
-- overwrite every movie (title, price, cover_url, trailer_url, ...).
--
-- This migration removes anonymous write access and keeps public read only.
--
-- BEFORE APPLYING: the prototype seeds/edits movies from the browser using the
-- anon key. Once you run this, those client-side writes will fail (by design).
-- Move seeding and admin edits to a server context (Vercel serverless function
-- or Supabase Edge Function) that uses the SERVICE_ROLE key — never ship the
-- service-role key to the browser.
--
-- Run in: Supabase Dashboard → SQL Editor → New query.

-- Drop the permissive write policies from migration 001.
drop policy if exists "Anon insert" on public.movies;
drop policy if exists "Anon update" on public.movies;

-- Public read stays (viewer homepage / detail pages).
-- (policy "Public read" from migration 001 is left in place)

-- No INSERT/UPDATE/DELETE policies = anon & authenticated roles cannot write.
-- The service_role key bypasses RLS entirely, so server-side seeding still works.

-- If you also opened the storage buckets for anon uploads (see commented block
-- in 001), revoke those too and issue signed upload tokens server-side instead:
-- drop policy if exists "Anon covers upload"   on storage.objects;
-- drop policy if exists "Anon trailers upload" on storage.objects;
