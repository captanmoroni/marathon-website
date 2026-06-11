# Changelog

## 1.2.0 — 2026-06-10 · Retention features (competitive gap analysis) + export docs

Competitive analysis vs Icy Veins / Maxroll / Wowhead / Mobalytics identified five
highest-ROI retention gaps; all five implemented and live-verified:

1. **Shareable build permalinks** (Maxroll-style) — planner state encodes to
   `?b=<base64url>`; "Share build link" button copies the URL; shared links override
   local state. Verified: encoded Thief build applied shell, picks, and sliders from URL.
2. **Faction progression tracker** (Wowhead-style) — every documented unlock is a
   persistent checkbox with per-rank and per-faction progress bars (`lib/prefs.js`).
   Verified: 2/19 progress shown and persisted.
3. **Runner comparison tool** (Mobalytics-style) — new `/compare?a=&b=` route,
   URL-driven side-by-side kits; added to sitemap + prerender (now 33 routes).
4. **"New since last visit" news badge** — counts unseen items on the News tab;
   cleared by visiting. Verified: badge "7" → cleared.
5. **Bookmarks + recently viewed** — star button on all detail pages; "Your Terminal"
   home panel (bookmarks / recent / tracked faction progress), hidden for new visitors.

Deferred with reasons (not cosmetic-rejected, blocked): comments/community builds
(backend), item database (no sourced dataset), both logged in FEATURE_MATRIX.md.

Also added the AI-export documentation set: PROJECT_SUMMARY.md, ARCHITECTURE.md,
FEATURE_MATRIX.md, FILE_TREE.md.

## 1.1.0 — 2026-06-10 · Audit-gap closure

### SEO → complete
- Static prerendering: `scripts/prerender.mjs` + `src/entry-server.jsx` render all 32
  content routes to real HTML in `dist/` (full markup, per-route title/description/
  canonical/OG) via Vite SSR; wired into `npm run build`. SSR-safety guards added to
  `lib/db.js` and `Planner.jsx` (localStorage absent in Node).
- Production domain configurable via `VITE_SITE_URL` (seo.js, build-seo.mjs,
  prerender.mjs); placeholder remains only as fallback.

### Accessibility → complete
- Skip-to-content link; `<main id="content" tabIndex={-1}>` receives focus on route change.
- Map POIs keyboard-operable: `tabIndex=0`, `role="button"`, `aria-pressed`,
  `aria-label`, Enter/Space handlers.
- Global `:focus-visible` outline; `prefers-reduced-motion` kills animations/transitions.
- Admin gear link `aria-label`; footer text contrast raised (slate-600/700 → slate-400).

### Operations
- Fully automated ingestion: `.github/workflows/ingest-news.yml` (6-hour cron,
  commits feed changes → triggers deploy).
- Deploy configs: `netlify.toml` and `vercel.json` (SPA fallback rewrites, immutable
  asset caching, security headers, ingest-on-build).
- Analytics: `src/lib/analytics.js` — cookieless pageview/event tracking, local ring
  buffer, optional `VITE_ANALYTICS_ENDPOINT` beacon; wired to route changes in Layout.
- Error monitoring: `src/lib/monitor.js` (uncaught errors + unhandled rejections,
  local ring buffer, optional `VITE_ERROR_ENDPOINT` beacon) + `ErrorBoundary` around
  routes with retry UI; telemetry readout panel in `/admin`.

### Verified (live browser + disk)
- 32 prerendered HTML files with real content (Sentinel page contains "Defender
  System"/"Snare Mine" without JS) and correct per-route head tags.
- Skip link present; focus lands on `#content` after navigation; POI Enter-key toggle
  sets `aria-pressed`; thrown test error captured to the monitor buffer; 13 pageview
  events recorded; `VITE_SITE_URL` override confirmed in generated sitemap.

## 1.0.0 — 2026-06-10 · Platform rebuild

Transformed the single-file fan page (`../marathon-endgame-guide.html`, kept as legacy
reference) into a production-grade guide platform. Audit and plan in `../docs/`
(AUDIT.md, ROADMAP.md, SOURCES.md).

### Phase 0 — Audit & truth pass
- Audited the legacy file; cataloged 10 technical-debt items and a full inventory of
  fabricated content (docs/AUDIT.md).
- Researched and recorded verified Marathon data with citations (docs/SOURCES.md).

### Phase 1 — Foundation (priorities 1, 2, 3, 10)
- **Removed all fabricated content.** Invented abilities ("Stasis Lock", "Super-Dash
  Overdrive"), fake weapons (Ares RG, Overrun AR), the fictional "6-wing raid", fake
  patch notes 2.1.0/2.0.2, and invented faction trees are gone.
- **New content database** (`src/data/db/*.json`): 8 runners, 6 factions (62 documented
  upgrade unlocks for CyberAcme/NuCaloric/Traxus; MIDA/Arachne/Sekiguchi labeled as
  pending public documentation rather than invented), 5 maps with POI data, 6 guides,
  news, site meta. Every record carries `sources[]` + `lastVerified`; editorial content
  is flagged and badged.
- **Vite + React 18 + React Router + Tailwind v4** scaffold; no runtime transpilation,
  no CDN scripts.
- **Full guide hierarchy:** Home, Guides index + article pages, Runner index + 8 detail
  pages, Faction index + 6 detail pages, Map index + 5 interactive map pages, Build
  Planner, News, Search, Admin, 404. Breadcrumbs + cross-links; zero dead ends.

### Phase 2 — Discovery (priorities 4, 5, 6)
- **Advanced search** (`src/lib/search.js`): weighted inverted index over all
  collections + news, prefix matching, type filters, snippet extraction, term
  highlighting; header quick-search with keyboard navigation; index auto-invalidates
  on CMS edits.
- **Interactive maps**: schematic SVG per zone with clickable POI markers, detail
  panel, and layer toggles (loot / hazards / exfil / locked / POI).
- **Automated news ingestion** (`scripts/ingest-news.mjs`, `npm run ingest:news`):
  pulls the official Bungie.net RSS feed, filters Marathon items, decodes entities,
  absolutizes URLs, dedupes against seeded sourced entries. First live run ingested
  6 real Bungie patch articles (1.0.6.3 → 1.1.0.1).

### Phase 3 — Publishing quality (priorities 7, 8, 9)
- **CMS** at `/admin`: edit/create records against the schema with a localStorage
  draft overlay (changes render site-wide immediately, badged "LOCAL DRAFT"),
  per-record discard, JSON export for committing. Enforces the sourcing policy:
  records without sources must be marked `unverified`.
- **SEO**: per-route titles/descriptions/canonical/OG + Article JSON-LD via `useSEO`;
  `scripts/build-seo.mjs` generates `sitemap.xml` (33 URLs) and `robots.txt` on build.
- **Performance**: route-level code splitting (14 lazy chunks; largest page chunk
  ~7.8 kB), vendor chunk separation, prebuilt CSS (~6 kB gzip), memoized search index.

### Fixes during verification
- Planner page was missing its `useSEO` call (stale document titles) — fixed.
- News ingest: HTML entities, relative Bungie URLs, and merge dedupe key — fixed.

### Verified
- All 10 route families render with correct titles (live browser check).
- Search returns scored results ("vault" → 5, "snare" → 2) with highlighting.
- Map POI click → detail panel; layer toggles work.
- CMS draft round-trip: edit visible on site + picked up by search, then discarded.
- `npm run build` clean; `npm run ingest:news` pulls live official feed.
