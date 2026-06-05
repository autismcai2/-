create table if not exists public.app_state (
  state_key text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.app_state enable row level security;

drop policy if exists "public app_state read" on public.app_state;
create policy "public app_state read"
on public.app_state
for select
to anon
using (true);

drop policy if exists "public app_state write" on public.app_state;
create policy "public app_state write"
on public.app_state
for all
to anon
using (true)
with check (true);

insert into public.app_state (state_key, payload)
values ('default', '{}'::jsonb)
on conflict (state_key) do nothing;

insert into storage.buckets (id, name, public)
values ('pattern-covers', 'pattern-covers', true)
on conflict (id) do nothing;

drop policy if exists "public storage read" on storage.objects;
create policy "public storage read"
on storage.objects
for select
to anon
using (bucket_id = 'pattern-covers');

drop policy if exists "public storage write" on storage.objects;
create policy "public storage write"
on storage.objects
for all
to anon
using (bucket_id = 'pattern-covers')
with check (bucket_id = 'pattern-covers');
