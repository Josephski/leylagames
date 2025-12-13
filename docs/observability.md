# Observability (förslag)

- **Felspårning**: Lägg till Sentry (eller liknande) för både frontend och Next API-routen.
  - Frontend (Vite/Next): installera `@sentry/react` och initiera i entrypoint (`src/main.tsx` och `app/layout.tsx` med `Sentry.init` i `useEffect`/client).
  - API-route (`app/api/leaderboard/route.ts`): lägg `@sentry/nextjs` och wrappa handlare eller använd `captureException` i catch.
  - Miljövariabler: `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE`.
- **Loggning**: skriv serverloggar (API) till hostens logg och överväg att skicka strukturerade events till en loggtjänst (t.ex. Axiom/Logtail) via fetch i API-routen vid fel.
- **Metrics**: enkelt klick/score-event kan skickas via en lättvikt SDK (PostHog/Amplitude) eller egen endpoint.
- **CI-artefakter**: behåll Playwright traces på fel; de genereras redan med `trace: 'on-first-retry'`.

Detta är vägledande – ingen kod är inlagd än. Lägg till när ni bestämt leverantör. 
