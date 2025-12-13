-- Skapa RLS policies för leaderboards-tabellen.
-- Antag att tabellen ser ut:
-- create table leaderboards (
--   id bigserial primary key,
--   game_id text not null,
--   user_name text not null,
--   score int not null,
--   created_at timestamptz default now()
-- );

-- Aktivera RLS
alter table leaderboards enable row level security;

-- Tillåt läsning för public key (alla spel) – kan begränsas per game_id
create policy "public select leaderboard"
  on leaderboards
  for select
  using (true);

-- Tillåt insert för public key, men begränsa inslag till rimligt värde
create policy "public insert leaderboard"
  on leaderboards
  for insert
  with check (
    score >= 0
    and score <= 10000000
    and char_length(user_name) <= 40
  );

-- (Valfritt) Begränsa per spel:
--   add condition: game_id in ('flag-quiz', 'ditt-andra-spel')

-- Se till att service role kan göra allt
-- (service role bypassar normalt RLS, men behåll default)

-- Index för snabbare läsning
create index if not exists idx_leaderboards_game_score on leaderboards(game_id, score desc);
