-- Imposter multiplayer rooms. Public by room code for a casual party game.

create table if not exists public.imposter_rooms (
  code text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.imposter_rooms enable row level security;

drop policy if exists "imposter read" on public.imposter_rooms;
drop policy if exists "imposter insert" on public.imposter_rooms;
drop policy if exists "imposter update" on public.imposter_rooms;

create policy "imposter read" on public.imposter_rooms
  for select using (true);

create policy "imposter insert" on public.imposter_rooms
  for insert with check (true);

create policy "imposter update" on public.imposter_rooms
  for update using (true);

do $$
begin
  alter publication supabase_realtime add table public.imposter_rooms;
exception
  when duplicate_object then null;
end $$;
