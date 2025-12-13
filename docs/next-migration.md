# Next/Edge migrationsplan för Leyla Games

Målet är att flytta portalen till en edge-first stack (Next.js på Vercel/Cloudflare Pages/Workers) utan att skriva om varje spelkomponent.

## Arkitektur
- **Portal**: Next.js (App Router), ISR/SSG för statiska sidor, edge runtimes för snabba reads.
- **Spel**: Varje spel är en React-komponent som renderas i en “game shell” på klientsidan. Behåll nuvarande spelkod så långt som möjligt.
- **Data**: Supabase (Postgres + RLS) för profiler/leaderboard. Edge cache (KV/Redis) för heta reads. Writes via API-routes/edge functions.
- **Assets**: Flaggor/sprites/ljud på R2/S3 + CDN med versionerade URL:er.
- **AI** (valfritt): Lägg ett “AI-gateway”-API som anropar OpenAI/Anthropic/Workers AI och kan bytas ut.

## Delmål 1 – initiera Next-projektet
1. `pnpm create next-app` (eller `npx create-next-app`) med TypeScript, App Router, eslint. Lägg det i `apps/portal` om ni vill gå mot monorepo (turbo/pnpm workspaces), annars migrera direkt.
2. Installera dependencies: `react-router-dom` ersätts av Next-router, behåll `@supabase/supabase-js`, `zustand` etc.
3. Konfigurera `next.config.js` för edge runtimes där möjligt (t.ex. `runtime: 'edge'` på lätta routes).
4. Lägg in global CSS och UI-kit (kan återanvända `src/index.css`/`App.css` efter viss justering).

## Delmål 2 – flytta portalen (routing/UI)
1. Skapa `/app/page.tsx` för biblioteket (mappa från nuvarande `HomePage` i `src/App.tsx`).
2. Skapa dynamisk route `/app/games/[slug]/page.tsx` som:
   - Läser `slug` och slår upp spelet via samma registry (flytta `src/platform/games.ts` till t.ex. `app/lib/games.ts`).
   - Renderar en game-shell med `GameProvider`.
   - Hydrerar klientkomponenter (markera spelkomponenter som `use client`).
3. Bevara dev-URL-flödet: queryparams (`?country=SE&dev=1`) ska passas vidare till spelet.

## Delmål 3 – dela kod mellan Vite/Next (övergång)
1. Flytta spelkomponenterna och `platform/` till ett delat paket (t.ex. `packages/games-core` i ett monorepo) eller en `shared/`-mapp som båda bygger från.
2. Behåll Vite-versionen tills Next-portalen är verifierad; nyttja npm/pnpm workspaces så att kod inte dupliceras.
3. Lägg till build-step för shared-paket i CI (turbo pipeline eller pnpm recursive).

## Delmål 4 – backend/API i Next
1. Lägg ett API-endpoint per behov i `/app/api/leaderboard/route.ts` (server actions eller edge handlers) som proxar mot Supabase. Detta ger er:
   - Möjlighet till cache-kontroll och rate limiting.
   - Mindre exponering av Supabase-keys i klienten.
2. Lägg RLS-policies på Supabase-tabeller och se till att API:et använder service key (server-side), medan klienten bara använder public anon key för reads som tillåts via RLS.
3. Cacha heta leaderboard-reads i KV/Redis (t.ex. Upstash eller Cloudflare KV) med kort TTL, invalidation vid writes.

## Delmål 5 – deployment/edge
1. Vercel: sätt `vercel.json`/project settings att köra på edge för snabba routes, och ISR för bibliotekssidor.
2. Cloudflare Pages/Workers: använd `next-on-pages` om ni vill till CF; se till att Supabase region matchar majoriteten av trafiken eller att ni använder read-replicas.
3. Miljövariabler: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_KEY` för klient; `SUPABASE_SERVICE_KEY` för API/server actions.

## Delmål 6 – testning & cutover
1. Uppdatera Playwright: nya selectors/URL:er (`/games/flag-quiz`) – återanvänd testlogik men kör mot Next-dev och Next-build.
2. CI: lägg till Next build (`next build`) och Playwright mot `next start`. Behåll Vite-pipeline tills cutover.
3. När Next-portalen är stabil: arkivera Vite-appen eller behåll den som fallback.

## Snabb checklista (MVP-flytt)
- [ ] Initiera Next-app + dela `platform/games.ts` och `GameProvider`.
- [ ] Klientkomponenter för varje spel (`'use client'`).
- [ ] API-route för leaderboard writes/reads (server-side Supabase service key).
- [ ] Miljövariabler satta i Vercel/Cloudflare.
- [ ] Playwright-test justerade till nya routes.
- [ ] Edge caching policy på spelbiblioteket + ISR.

## Kostnads- och AI-notes
- Använd edge runtimes och KV-cache för att minimera DB-läsningar.
- För AI-funktioner (hints, moderation): kapsla i ett `/app/api/ai/route.ts` som anropar OpenAI/Anthropic/Workers AI; byt leverantör genom config.
- Håll alla spel mot ett internt “game SDK” (typ `platform/sdk.ts`) så ni kan byta portal/ramverk utan att röra spelen.
