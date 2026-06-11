# PROJECT_SUMMARY — Runner Terminal

**What:** Production-grade guide platform for Bungie's *Marathon* (2026), modeled on Icy Veins /
Maxroll / Wowhead. Unofficial fan project; every game fact cites a source; editorial opinion is
labeled; undocumented data is shown as a labeled gap, never invented.

**Origin:** rebuilt from a single-file CDN React prototype after an audit found most of its game
data fabricated. Audit/roadmap/bibliography: `../docs/AUDIT.md`, `../docs/ROADMAP.md`,
`../docs/SOURCES.md`. Full change history: `CHANGELOG.md`.

**Stack:** Vite 6 · React 18 · React Router 6 · Tailwind CSS 4 (`@tailwindcss/vite`) ·
lucide-react. No backend — content is versioned JSON; user state is localStorage.

**Key numbers (verified 2026-06-10):**
- 33 prerendered static HTML routes (full markup + per-route meta, no JS needed for crawlers)
- 25 sourced content records (8 runners, 6 factions, 5 maps, 6 guides) + live-ingested news
- 62 documented faction unlocks; 3 faction trees explicitly marked "pending public documentation"
- 15 lazy route chunks; largest page chunk ~8 kB; vendor 54 kB gzip; CSS 6 kB gzip

**Feature set:** guide hierarchy with breadcrumbs · weighted inverted-index search (header
quick-search + full page, filters/snippets/highlighting) · interactive SVG maps (POI click +
keyboard, layer toggles) · build planner with shareable permalinks (`/planner?b=<base64url>`) ·
runner comparison tool (`/compare?a=&b=`) · faction progression tracker (persisted checklists) ·
bookmarks + recently-viewed ("Your Terminal" home panel) · "new since last visit" news badge ·
in-browser CMS with draft overlay + JSON export + sourcing policy enforcement · automated
Bungie.net news ingestion (script + 6-hour CI cron) · SEO (per-route meta/canonical/JSON-LD,
sitemap, robots, prerender) · cookieless analytics + error monitoring (local buffers, optional
beacon endpoints) · full a11y pass (skip link, focus management, keyboard maps, reduced-motion).

**Run:** `npm install && npm run dev` (port 5180). Build: `npm run build` (sitemap → vite →
prerender). News refresh: `npm run ingest:news`.

**Env vars (build-time):** `VITE_SITE_URL` (production domain; required for correct canonical/
sitemap URLs), `VITE_ANALYTICS_ENDPOINT`, `VITE_ERROR_ENDPOINT` (both optional beacons).

**Hosting:** any static host. `netlify.toml` / `vercel.json` included (SPA fallback rewrite,
immutable asset caching, security headers, ingest-on-build). `.github/workflows/ingest-news.yml`
re-ingests news every 6h once the repo is on GitHub.

**Honest limitations:** client-only CMS (no auth; drafts are per-browser until exported and
committed) · map POI positions are schematic, not surveyed coordinates · MIDA/Arachne/Sekiguchi
upgrade trees await public documentation · no community features (accounts/comments) — needs a
backend · prerender covers content routes; `/search` and `/admin` are CSR-only by design.
