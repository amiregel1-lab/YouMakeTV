-- Add backdrop_url column for wide 16:9 hero images.
-- Separate from cover_url (portrait poster) so the hero can use a proper
-- landscape image without upscaling a 400x600 poster to full-width.
-- Run in: Supabase Dashboard → SQL Editor → New query.

alter table public.movies
  add column if not exists backdrop_url text;
