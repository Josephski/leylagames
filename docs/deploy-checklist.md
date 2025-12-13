# Deploy-checklist (produktion)

## Miljövariabler (läggs som secrets i host)
- Publikt (klient): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY`
- Server (Next API): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE`, `LEADERBOARD_API_KEY`
- (Valfritt) Observability: `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE`

## Supabase
1) Skapa tabellen om den saknas (se README och `docs/rls-leaderboards.sql`).
2) Aktivera RLS och kör policys från `docs/rls-leaderboards.sql`.
   - Med supabase CLI (om installerat):
     ```bash
     supabase db remote commit docs/rls-leaderboards.sql
     ```
     eller kör SQL-innehållet i Supabase SQL editor.
3) Verifiera att public-anon key kan `select/insert` på `leaderboards` enligt RLS och att service role fungerar för writes.

## Bygg & test
- `npm run lint`
- `npm run type-check`
- `npm run build` (Vite)
- `npm run build:next` (Next)
- `npm run test:e2e` (Vite)
- `npm run test:e2e:next` (Next)

## Hosting / runtime
- Primär portal: Next-build + `npm run start:next` (eller Vercel/Cloudflare auto).
- Se till att API-routen `/api/leaderboard` är nåbar och har `SUPABASE_SERVICE_ROLE`.
- Aktivera rate limiting på CDN/proxy (API:t har inbyggd 429 per IP, men nätverksnivå är starkare).

## Assets och CSP
- Lägg flaggbilder i `public/flags` eller på CDN (t.ex. S3/R2) och uppdatera eventuell fallback-URL.
- Justera CSP om du byter domän för bilder eller lägger till Sentry/analytics:
  - img-src: `self` + din flaggdomän + data:
  - connect-src: `self` + `*.supabase.co` + observability-endpoint

## Observability
- Se `docs/observability.md` för Sentry/loggning/metrics.

## Manuell QA innan release
- Prova dev-url: `/games/flag-quiz?country=SE&dev=1`
- Testa leaderboard-save med giltig service key.
- Testa att RLS stoppar otillåtna inserts (felaktigt score > 10M eller för långt namn).
