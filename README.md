# Leyla Games – webbaserad spelplattform

En liten spelplattform byggd med Vite, React och TypeScript. Första spelet är ett flaggquiz där du gissar landet via flaggan och lägger bokstäverna i rätt ordning, men strukturen är nu byggd för att kunna lägga till fler spel över tid.

## Snabbstart
- Installation: `npm install`
- Utvecklingsserver (Vite): `npm run dev` (http://localhost:4900, strikt port)
- Utvecklingsserver (Next/edge-prototype): `npm run dev:next` (http://localhost:4310)
- Bygg Vite: `npm run build`
- Bygg Next: `npm run build:next`
- Förhandsvisa Vite-build: `npm run preview`

## Projektstruktur
```
src/
  assets/          # Bilder/ljud (ej incheckade)
  components/      # UI-komponenter (FlagGame, Leaderboard)
  data/            # Datastrukturer (länder)
  game/            # Grundläggande spelbyggstenar
  hooks/           # Custom hooks (canvas-engine)
  lib/             # Klienter (Supabase)
  platform/        # Spelplattform (game registry, context, SDK)
  store/           # Zustand-store för game state
  utils/           # Hjälpfunktioner
  App.tsx          # Huvudapp
  main.tsx         # Entrypoint
```

## Teknologier
- React 18 + TypeScript
- Vite 5
- Zustand för state
- Supabase (valfritt) för topplista

## Supabase (leaderboard)
Vill du spara poäng i en topplista?
1. Skapa ett Supabase-projekt.
2. Kör i SQL-editorn:
   ```sql
   create table leaderboards (
     id bigserial primary key,
     game_id text not null,
     user_name text not null,
     score int not null,
     created_at timestamptz default now()
   );
   ```
3. Lägg till miljövariabler (lokalt i `.env` eller i Vercel/Netlify/Cloudflare/Next):
  ```
  VITE_SUPABASE_URL=https://your-project-ref.supabase.co
  VITE_SUPABASE_KEY=public-anon-key
  ```
   För Next-prototypen kan du även använda:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_KEY=public-anon-key
   ```
4. Frontend använder `src/lib/supabase.ts`, `src/platform/sdk.ts` och `src/components/Leaderboard.tsx`.

I databasen används `game_id` för att skilja olika spel åt. För flaggquizet är `game_id` satt till `flag-quiz` (se `src/platform/games.ts`).

### Next API-route (server-side)
- Next-prototypen har en API-route `app/api/leaderboard/route.ts` som kan använda en service key för writes.
- Lägg till server-nyckel i miljön för Next:
 ```
  SUPABASE_SERVICE_ROLE=your-service-key
  SUPABASE_URL=https://your-project-ref.supabase.co
  NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
  NEXT_PUBLIC_SUPABASE_KEY=public-anon-key
  LEADERBOARD_API_KEY=optional-shared-secret
  ```
  (Vercel/Cloudflare: sätt dessa som project secrets.)
- SDK försöker först anropa `/api/leaderboard` om den finns (Next), annars faller den tillbaka till direktanrop mot Supabase (Vite). API:et kräver `LEADERBOARD_API_KEY` om den är satt.
- API:et begränsar namn till 40 tecken, klampar score till 0–10 000 000 och cacher GET-responsen kort (15s) i minne.
- Sätt RLS-policies på `leaderboards` för att tillåta `select`/`insert` för publik nyckel med rätt spel-id, eller kör alla writes via service key. Lägg gärna till rate limiting på nätverksnivå/proxy också (API:t har inbyggd 429-rate-limit per IP).
- Exempel på RLS-policies finns i `docs/rls-leaderboards.sql`. Exempel på miljövariabler finns i `.env.example`.

## Nästa steg
- Lägg till fler länder/levels eller andra spellägen.
- Koppla in ljud/sprites under `src/assets`.
- Anpassa UI:t eller översätt till fler språk.
- Kör lint/type-check/build i CI (se `.github/workflows/ci.yml`). CI kör både Vite-build + Vite-e2e och Next-build + Next-e2e.
- Host flagg-bilder lokalt om du vill undvika externa beroenden, eller använd fallback-emoji (implementerat).
- E2E-smoke med Playwright: `npm run test:e2e` (installerar Chromium via CI; lokalt kan du köra `npx playwright install chromium` första gången). Testet navigerar till `/games/flag-quiz?country=SE&dev=1`.
- E2E mot Next-build: `npm run build:next && npm run start:next` i en terminal, sedan `E2E_TARGET=next PORT=4310 npm run test:e2e` (eller använd scriptet `npm run test:e2e:next` som sätter variablerna).
- Svårighet kan bytas i inställningar (Lätt/Mellan/Svår) och sparas i localStorage. Hjälp-overlay beskriver kontroller och poäng.
- Devtest för flaggquiz: `/games/flag-quiz?country=SE&dev=1` forcerar land och visar en dev-knapp för att autofylla svaret (används i e2e).
- För produktion: följ `docs/deploy-checklist.md` (secrets, RLS, build/test, CSP, observability).

## Plattform & framtida migrering
- Spel registreras i `src/platform/games.ts` med id/slug/namn/komponent.
- `src/platform/GameContext.tsx` ger ett `useCurrentGame`‑API som spel kan använda för att hämta metadata (game id, m.m.).
- `src/platform/sdk.ts` är startpunkten för gemensam spel‑logik (sessions, score, leaderboard) och kan växa till ett internt SDK.
- Appen använder i dag `react-router-dom` för routing, men strukturen är förberedd så att portalen senare kan flyttas till t.ex. Next.js/edge utan att behöva skriva om varje spelkomponent.
