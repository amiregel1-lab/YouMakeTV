-- YouMakeTV — moderation state on the movies table
--
-- ✅ APPLIED in production. These columns exist on public.movies, so
-- /api/admin/movies can persist a moderation decision and the desk's moderation
-- controls are live. Every statement below is idempotent (`if not exists`), so
-- re-running it in the Supabase SQL editor is safe and changes nothing.
--
-- ── Why ─────────────────────────────────────────────────────────────────────
--
-- `status` has existed since migration 001 (default 'Approved'), but every
-- other thing a moderator decides — the note explaining a rejection, whether a
-- film is visible to viewers, its shelf flags, and who decided when — lived
-- only in one browser's localStorage. Approving a film in one browser left no
-- trace in another, and a reload lost the queue. These columns are where those
-- decisions live from now on.
--
-- Every column is added with `if not exists` and a default that matches the
-- state the catalog is actually in today, so applying this changes nothing an
-- existing viewer can see:
--   · visible defaults true  — the live catalog is all visible
--   · trending / new_release default false — no film carries either flag today
--   · moderation_notes / moderated_at / moderated_by are null — nothing has been
--     moderated server-side yet, and null is the honest record of that

alter table public.movies
  add column if not exists moderation_notes text,
  add column if not exists visible          boolean     not null default true,
  add column if not exists trending         boolean     not null default false,
  add column if not exists new_release      boolean     not null default false,
  add column if not exists moderated_at     timestamptz,
  add column if not exists moderated_by     text;

-- ── Status vocabulary ───────────────────────────────────────────────────────
-- The five words the admin console has always used. Added NOT VALID on purpose:
-- it enforces the vocabulary on every future write without failing this
-- migration on a legacy row that says something else. Validate later, once the
-- table is known to be clean:
--
--   alter table public.movies validate constraint movies_status_check;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'movies_status_check'
  ) then
    alter table public.movies
      add constraint movies_status_check
      check (status in ('Approved', 'Pending Review', 'Rejected', 'Suspended', 'Draft'))
      not valid;
  end if;
end $$;

-- A film with no status at all is not a state the desk can act on; treat the
-- catalog's own default as the answer.
update public.movies set status = 'Approved' where status is null;

-- The moderation queue reads "everything not yet cleared", and the desk's nav
-- badge counts it on every page load.
create index if not exists movies_status_idx on public.movies (status);
create index if not exists movies_updated_at_idx on public.movies (updated_at desc);
create index if not exists movies_created_at_idx on public.movies (created_at desc);

-- ── Storage ─────────────────────────────────────────────────────────────────
-- Nothing to do here if `covers` and `trailers` already exist and are public.
-- The Growth OS desk uploads through /api/admin/media, which mints a signed
-- upload URL with the SERVICE_ROLE key server-side — so no anon write policy on
-- storage.objects is needed, and any left over from migration 001 should still
-- be dropped (see the note at the end of 003_harden_rls.sql).
