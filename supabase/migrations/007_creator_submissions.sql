-- Creator uploads use the existing moderated catalog; private ownership and
-- full-film URLs are accessible only to the server, never the public anon key.
begin;
lock table public.movies in share row exclusive mode;
create sequence if not exists public.movies_id_seq;
select setval('public.movies_id_seq', greatest(coalesce((select max(id) from public.movies), 0), (select last_value from public.movies_id_seq)), true);
alter table public.movies alter column id set default nextval('public.movies_id_seq');
create table if not exists public.creator_movie_owners (
  movie_id integer primary key references public.movies(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid not null unique,
  film_url text,
  created_at timestamptz not null default now()
);
alter table public.creator_movie_owners enable row level security;
revoke all on public.creator_movie_owners from anon, authenticated;
grant all on public.creator_movie_owners to service_role;
create index if not exists creator_movie_owners_owner_idx on public.creator_movie_owners(owner_user_id);
drop policy if exists "Public read" on public.movies;
create policy "Public read" on public.movies for select using (status = 'Approved' and visible = true);

create or replace function public.create_creator_draft(owner_id uuid, request_id_input uuid, film jsonb)
returns integer language plpgsql security definer set search_path = public as $$
declare movie_key integer;
begin
  perform pg_advisory_xact_lock(hashtext(owner_id::text), hashtext(request_id_input::text));
  select movie_id into movie_key from public.creator_movie_owners where request_id = request_id_input and owner_user_id = owner_id;
  if movie_key is not null then return movie_key; end if;
  insert into public.movies(title, subtitle, description, genre, duration, creator_name, price, cover_url, trailer_url, rating, language, tools, status, visible)
  values (film->>'title', film->>'subtitle', film->>'description', film->>'genre', film->>'duration', film->>'creator_name', (film->>'price')::numeric, film->>'cover_url', film->>'trailer_url', film->>'rating', film->>'language', array(select jsonb_array_elements_text(film->'tools')), 'Draft', false)
  returning id into movie_key;
  insert into public.creator_movie_owners(movie_id, owner_user_id, request_id, film_url) values (movie_key, owner_id, request_id_input, film->>'film_url');
  return movie_key;
end $$;
revoke all on function public.create_creator_draft(uuid, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.create_creator_draft(uuid, uuid, jsonb) to service_role;
commit;
