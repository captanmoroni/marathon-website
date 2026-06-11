# Runner Terminal — Marathon (2026) Guide Platform

A production-grade, Icy-Veins-style guide database for Bungie's Marathon. Every game
fact cites a source; editorial opinion is labeled; gaps in public documentation are
shown as gaps instead of being invented.

## Quick start

```bash
npm install
npm run dev          # http://localhost:5180
```

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Generates sitemap/robots, then production build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run ingest:news` | Pull official Bungie.net feed into `src/data/db/news.json` |

## Architecture

- **Content database** — `src/data/db/*.json`. Schema: `id`, `slug`, `type`,
  `sources[] {title,url}`, `lastVerified`, plus per-type fields. UI renders only from
  the DB; no game facts live in components.
- **CMS** — `/admin`. Edits write a localStorage overlay that takes effect site-wide
  immediately (badged LOCAL DRAFT). Export merged JSON and commit it to publish.
  Policy: unsourced records must set `unverified: true`.
- **Search** — `src/lib/search.js`, weighted inverted index with prefix matching,
  type filters, snippets, highlighting. Rebuilds when the CMS overlay changes.
- **SEO** — `src/lib/seo.js` (`useSEO` hook: title/meta/canonical/OG/JSON-LD) +
  `scripts/build-seo.mjs` (sitemap.xml, robots.txt). For full crawler coverage,
  front with prerendering/SSG (see roadmap Phase 4).
- **Performance** — route-level `React.lazy` chunks, vendor split, built Tailwind.

## Docs

- `../docs/AUDIT.md` — audit of the legacy single-file app, tech debt, fake-content inventory
- `../docs/ROADMAP.md` — phased plan and prioritized task list
- `../docs/SOURCES.md` — bibliography backing the database
- `CHANGELOG.md` — every change, by phase

Unofficial fan project. Marathon © Bungie. No affiliation.
