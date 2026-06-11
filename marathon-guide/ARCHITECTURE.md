# ARCHITECTURE — Runner Terminal

## Framework & libraries
- **Vite 6** — dev server, build, and SSR module loading for prerender
- **React 18** — UI; route-level `React.lazy` code splitting; `renderToString` for prerender
- **React Router 6** — `BrowserRouter` client / `StaticRouter` prerender
- **Tailwind CSS 4** via `@tailwindcss/vite` — theme tokens in `src/index.css` `@theme`
- **lucide-react** — icons (DB stores icon *names*; `components/icons.js` maps to components)

## Layered design
```
JSON content DB  →  lib (db/search/seo/prefs/analytics/monitor)  →  components  →  pages
```
Rule: **no game facts in component code** — UI renders only from the database.

## Content database (`src/data/db/`)
- `runners.json` `factions.json` `maps.json` `guides.json` — uniform schema:
  `{ id, slug, type, ...fields, sources[]{title,url}, lastVerified }`
  plus flags: `unverified`, `editorial`, and `upgradesNote` for documented gaps.
- `news.json` — written by `scripts/ingest-news.mjs` (official Bungie RSS, entity-decoded,
  URL-absolutized, deduped by date|title, seeded entries preserved as fallback).
- `meta.json` — site identity, current season, stat glossary, fallback `baseUrl`.

## Library layer (`src/lib/`)
- **db.js** — collection access + CMS **draft overlay**: localStorage layer merged over shipped
  JSON at read time (`_draft` flag); `rt-db-changed` event invalidates dependents. SSR-guarded.
- **search.js** — weighted inverted index built lazily over all collections + news; exact tokens
  full weight, prefix matches half; type filters, snippet extraction, `highlight()` splitter.
- **seo.js** — `useSEO` hook (title/description/canonical/OG/JSON-LD per route);
  `siteUrl()` = `VITE_SITE_URL` || meta.json fallback.
- **prefs.js** — bookmarks, recently-viewed (cap 8), faction upgrade progress, last-seen-news;
  all localStorage; `rt-prefs-changed` event for live UI updates.
- **analytics.js** — cookieless pageview/event buffer (cap 200) + optional `sendBeacon` to
  `VITE_ANALYTICS_ENDPOINT`.
- **monitor.js** — global error/unhandledrejection capture (cap 50) + optional beacon;
  paired with `components/ErrorBoundary.jsx` around all routes.

## Routing (`src/App.jsx` client · `src/entry-server.jsx` prerender)
14 client routes, all lazy: `/`, `/guides(/:slug)`, `/runners(/:slug)`, `/factions(/:slug)`,
`/maps(/:slug)`, `/planner`, `/compare`, `/news`, `/search`, `/admin`, `*`→404.
`entry-server.jsx` mirrors the table with **eager** imports (lazy renders Suspense fallbacks
in `renderToString`).

## Build pipeline (`npm run build`)
1. `scripts/build-seo.mjs` → `public/sitemap.xml` (34 URLs) + `robots.txt` (disallows `/admin`)
2. `vite build` → hashed chunks (vendor split via `manualChunks`)
3. `scripts/prerender.mjs` → Vite SSR loads `entry-server.jsx`, renders **33 routes** to
   `dist/<path>/index.html` with per-route title/description/canonical/OG injected.
   `/search` + `/admin` intentionally CSR-only (dynamic/robots-excluded).

## State & persistence (all client-side)
| Store | Key | Purpose |
|---|---|---|
| CMS drafts | `rt-cms-overlay-v1` | record edits until exported |
| Planner build | `rt-planner-v1` | last build (URL param `?b=` overrides) |
| Bookmarks/recent/progress | `rt-bookmarks/recent/faction-progress-v1` | personalization |
| News seen | `rt-last-seen-news-v1` | nav badge |
| Telemetry | `rt-analytics-buffer-v1`, `rt-errors-v1` | local observability |

## Deployment
Static host + SPA fallback rewrite. `netlify.toml` / `vercel.json` configure rewrites, immutable
asset caching, security headers, and run `ingest:news` before build. GitHub Action cron re-ingests
news every 6 hours and commits, triggering deploy-on-push.
