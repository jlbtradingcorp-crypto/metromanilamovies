create type public.staff_role as enum ('admin', 'editor');
create type public.publication_status as enum ('draft', 'published', 'archived');
create type public.submission_status as enum ('new', 'reviewing', 'resolved', 'spam');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role public.staff_role not null default 'editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cinemas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  mall text,
  city text not null,
  address text,
  map_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name, city)
);

create table public.movies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  synopsis text,
  genre text[] not null default '{}',
  runtime_minutes integer check (runtime_minutes > 0),
  age_rating text,
  release_date date,
  trailer_url text,
  poster_path text,
  status public.publication_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.showtimes (
  id uuid primary key default gen_random_uuid(),
  movie_id uuid not null references public.movies(id) on delete cascade,
  cinema_id uuid not null references public.cinemas(id) on delete cascade,
  starts_at timestamptz not null,
  source_url text,
  last_verified_at timestamptz not null default now(),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (movie_id, cinema_id, starts_at)
);

create table public.editorial_updates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  body text not null,
  cover_path text,
  status public.publication_status not null default 'draft',
  published_at timestamptz,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 160),
  email text not null check (char_length(email) <= 320),
  subject text check (char_length(subject) <= 200),
  message text not null check (char_length(message) between 1 and 5000),
  status public.submission_status not null default 'new',
  source text not null default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index showtimes_starts_at_idx on public.showtimes (starts_at);
create index movies_status_idx on public.movies (status);
create index editorial_updates_status_idx on public.editorial_updates (status);
create index contact_submissions_status_idx on public.contact_submissions (status, created_at desc);

grant usage on schema public to anon, authenticated;
grant select on public.cinemas, public.movies, public.showtimes, public.editorial_updates to anon, authenticated;
grant select, insert, update, delete on public.profiles, public.cinemas, public.movies, public.showtimes, public.editorial_updates, public.contact_submissions, public.audit_log to authenticated;
grant usage, select on all sequences in schema public to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger cinemas_updated_at before update on public.cinemas for each row execute function public.set_updated_at();
create trigger movies_updated_at before update on public.movies for each row execute function public.set_updated_at();
create trigger showtimes_updated_at before update on public.showtimes for each row execute function public.set_updated_at();
create trigger editorial_updates_updated_at before update on public.editorial_updates for each row execute function public.set_updated_at();
create trigger contact_submissions_updated_at before update on public.contact_submissions for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.cinemas enable row level security;
alter table public.movies enable row level security;
alter table public.showtimes enable row level security;
alter table public.editorial_updates enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.audit_log enable row level security;

create policy "staff can read their profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "admins manage profiles" on public.profiles for all to authenticated using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')) with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'));

create policy "public reads active cinemas" on public.cinemas for select to anon, authenticated using (is_active = true);
create policy "staff manage cinemas" on public.cinemas for all to authenticated using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('admin', 'editor'))) with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('admin', 'editor')));

create policy "public reads published movies" on public.movies for select to anon, authenticated using (status = 'published');
create policy "staff manage movies" on public.movies for all to authenticated using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('admin', 'editor'))) with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('admin', 'editor')));

create policy "public reads active showtimes for published movies" on public.showtimes for select to anon, authenticated using (is_active = true and exists (select 1 from public.movies m where m.id = movie_id and m.status = 'published'));
create policy "staff manage showtimes" on public.showtimes for all to authenticated using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('admin', 'editor'))) with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('admin', 'editor')));

create policy "public reads published editorial" on public.editorial_updates for select to anon, authenticated using (status = 'published');
create policy "staff manage editorial" on public.editorial_updates for all to authenticated using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('admin', 'editor'))) with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('admin', 'editor')));

create policy "staff manage submissions" on public.contact_submissions for all to authenticated using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('admin', 'editor'))) with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('admin', 'editor')));
create policy "admins read audit log" on public.audit_log for select to authenticated using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'));

insert into storage.buckets (id, name, public) values ('public-posters', 'public-posters', true), ('private-submissions', 'private-submissions', false)
on conflict (id) do update set public = excluded.public;

create policy "staff upload posters" on storage.objects for insert to authenticated with check (bucket_id = 'public-posters' and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('admin', 'editor')));
create policy "staff update posters" on storage.objects for update to authenticated using (bucket_id = 'public-posters' and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('admin', 'editor'))) with check (bucket_id = 'public-posters' and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('admin', 'editor')));
create policy "staff delete posters" on storage.objects for delete to authenticated using (bucket_id = 'public-posters' and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('admin', 'editor')));
create policy "staff manage private submissions" on storage.objects for all to authenticated using (bucket_id = 'private-submissions' and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('admin', 'editor'))) with check (bucket_id = 'private-submissions' and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('admin', 'editor')));

revoke execute on function public.set_updated_at() from public;
