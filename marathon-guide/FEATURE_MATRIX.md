# FEATURE_MATRIX — Runner Terminal
Status verified 2026-06-10 by live browser tests + disk inspection (see CHANGELOG "Verified" sections).

| Feature | Status | Location | Verification evidence |
|---|---|---|---|
| Route hierarchy (15 routes incl. 404) | COMPLETE | `src/App.jsx`, `src/pages/*` | every route live-navigated; correct titles |
| Breadcrumb navigation | COMPLETE | `src/components/ui.jsx` (`Breadcrumbs`), 13 pages | `nav[aria-label="Breadcrumb"]` present on all non-home pages |
| Content DB w/ schema | COMPLETE | `src/data/db/*.json`, `src/lib/db.js` | 25 records; programmatic check: 25/25 have `sources[]` |
| Source attribution + badges | COMPLETE | `SourceList`/`UnverifiedBadge`/`EditorialBadge` in `ui.jsx` | rendered on all detail pages; CMS enforces policy |
| Advanced search (index, filters, snippets, highlight) | COMPLETE | `src/lib/search.js`, `src/pages/SearchPage.jsx`, Layout quick-search | "clearance"→4 results, `<mark>` highlights; draft records searchable instantly |
| Interactive maps (POI click, layers) | COMPLETE | `src/pages/MapDetail.jsx` | live POI click + Enter-key toggle (`aria-pressed`); 5 layer toggles |
| Build planner (real stat data) | COMPLETE | `src/pages/Planner.jsx` | totals from 12 documented upgrades + Cradle sliders; persisted |
| **Shareable build permalinks** | COMPLETE | `Planner.jsx` (`?b=` base64url codec + Share button) | encoded Thief build loaded via URL: shell/picks/sliders all applied |
| **Runner comparison tool** | COMPLETE | `src/pages/Compare.jsx` (`/compare?a=&b=`) | Recon vs Assassin: both kits rendered, URL-driven, 2 pickers |
| **Faction progression tracker** | COMPLETE | `src/pages/FactionDetail.jsx` + `src/lib/prefs.js` | 2 unlocks toggled → "2/19 checked", persisted to localStorage |
| **Bookmarks + recently viewed** | COMPLETE | `components/BookmarkButton.jsx`, Home `YourTerminal` panel | Recon bookmarked; recent list [Recon, CyberAcme, Perimeter]; panel renders |
| **"New since last visit" news badge** | COMPLETE | `Layout.jsx` + `prefs.js` | badge showed "7" with old last-seen; cleared after visiting /news |
| CMS (drafts, validation, export) | COMPLETE | `src/pages/Admin.jsx` | draft round-trip: site-wide render + search pickup + discard |
| News ingestion (official feed) | COMPLETE | `scripts/ingest-news.mjs` | 6 real Bungie articles ingested live (1.0.6.3→1.1.0.1) |
| Scheduled ingestion (CI cron) | COMPLETE* | `.github/workflows/ingest-news.yml` | 6h cron + commit; *activates when repo is pushed to GitHub |
| SEO: per-route meta/canonical/JSON-LD | COMPLETE | `src/lib/seo.js` (used by 15 pages) | live-verified per route |
| SEO: static prerendering | COMPLETE | `scripts/prerender.mjs`, `src/entry-server.jsx` | 33 HTML files in dist/; Sentinel page contains kit text without JS |
| Sitemap + robots.txt | COMPLETE | `scripts/build-seo.mjs` → `public/` + `dist/` | 34 URLs; `VITE_SITE_URL` override test passed |
| Performance (code splitting) | COMPLETE | `App.jsx` lazy routes, `vite.config.js` vendor chunk | 15 page chunks; vendor 54 kB gzip |
| Accessibility | COMPLETE | Layout (skip link, focus mgmt), MapDetail (keyboard POIs), `index.css` (focus-visible, reduced-motion) | all live-verified incl. focus lands on `#content` |
| Mobile responsiveness | COMPLETE | 36+ breakpoint classes; mobile nav | 375px: no overflow, working hamburger menu |
| Analytics (cookieless) | COMPLETE | `src/lib/analytics.js` | 13 pageviews captured live; optional beacon endpoint |
| Error monitoring | COMPLETE | `src/lib/monitor.js`, `ErrorBoundary.jsx` | thrown test error captured to buffer; /admin readout |
| Deploy configs | COMPLETE | `netlify.toml`, `vercel.json` | rewrites, caching, security headers, ingest-on-build |
| Production build | COMPLETE | `npm run build` | exit 0; "Prerendered 33 routes into dist/" |

## Not implemented (deliberate, needs backend or unavailable data)
| Feature | Blocker |
|---|---|
| Accounts / comments / community builds | requires backend + auth |
| Weapon/item database | no sufficiently sourced public dataset yet |
| MIDA / Arachne / Sekiguchi upgrade trees | not publicly documented (labeled in-app) |
| CMS auth | client-only by design; `/admin` robots-excluded |
| Surveyed map coordinates | community mapping data unavailable; labeled "schematic" |
