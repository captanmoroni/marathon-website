# FILE_TREE — Runner Terminal
★ = most important files for understanding the project.

```
marathon-guide/
├── package.json              ★ scripts: dev / build / preview / ingest:news
├── vite.config.js              Vite + React + Tailwind plugins, vendor chunk split
├── index.html                  SPA shell w/ base SEO meta (prerender rewrites per route)
├── netlify.toml                deploy: rewrites, headers, ingest-on-build
├── vercel.json                 deploy: same for Vercel
├── README.md                   quick start + architecture pointers
├── CHANGELOG.md              ★ every change by phase, with verification notes
├── PROJECT_SUMMARY.md        ★ one-page project overview (this export set)
├── ARCHITECTURE.md           ★ layered design, build pipeline, state stores
├── FEATURE_MATRIX.md         ★ feature → status → evidence
├── .github/workflows/
│   └── ingest-news.yml         6-hour cron: ingest official news, commit
├── public/
│   ├── robots.txt              generated (disallow /admin)
│   └── sitemap.xml             generated (34 URLs)
├── scripts/
│   ├── build-seo.mjs         ★ sitemap + robots from the content DB
│   ├── ingest-news.mjs       ★ Bungie.net RSS → news.json (decode/absolutize/dedupe)
│   └── prerender.mjs         ★ Vite SSR → 33 static HTML routes in dist/
└── src/
    ├── main.jsx                client entry (+ global error handlers)
    ├── entry-server.jsx      ★ eager route table for prerender (mirrors App.jsx)
    ├── App.jsx               ★ lazy route table (15 routes) + ErrorBoundary
    ├── index.css               Tailwind theme tokens, focus-visible, reduced-motion
    ├── data/db/              ★ THE CONTENT DATABASE (all game facts live here)
    │   ├── runners.json        8 shells: abilities, traits, tips, sources
    │   ├── factions.json       6 factions: 62 documented unlocks, labeled gaps
    │   ├── maps.json           5 zones: POIs (x/y/kind/note), tips, sources
    │   ├── guides.json         6 guides: body paragraphs, related refs, sources
    │   ├── news.json           ingested official feed + seeded sourced items
    │   └── meta.json           site identity, season, stat glossary, baseUrl fallback
    ├── lib/
    │   ├── db.js             ★ collection access + CMS localStorage overlay
    │   ├── search.js         ★ weighted inverted index, filters, snippets, highlight
    │   ├── seo.js            ★ useSEO hook, siteUrl() env override, JSON-LD
    │   ├── prefs.js          ★ bookmarks / recent / faction progress / news-seen
    │   ├── analytics.js        cookieless pageview buffer + optional beacon
    │   └── monitor.js          error capture buffer + optional beacon
    ├── components/
    │   ├── Layout.jsx        ★ nav, quick-search, skip link, focus mgmt, news badge
    │   ├── ui.jsx              Panel, Breadcrumbs, SourceList, badges, StatBar
    │   ├── icons.js            DB icon-name → lucide component map
    │   ├── BookmarkButton.jsx  star-toggle + records "recently viewed"
    │   └── ErrorBoundary.jsx   render-crash fallback + monitor reporting
    └── pages/                  one file per route, all consume lib/ + data/
        ├── Home.jsx            dashboard + YourTerminal personalization panel
        ├── GuidesIndex.jsx / GuideDetail.jsx
        ├── RunnersIndex.jsx / RunnerDetail.jsx
        ├── FactionsIndex.jsx / FactionDetail.jsx (progression tracker)
        ├── MapsIndex.jsx / MapDetail.jsx (interactive SVG map)
        ├── Planner.jsx         build planner + shareable permalinks (?b=)
        ├── Compare.jsx         runner vs runner (/compare?a=&b=)
        ├── News.jsx · SearchPage.jsx · Admin.jsx (CMS) · NotFound.jsx
        └── (dist/ = build output: hashed chunks + 33 prerendered HTML routes)

../docs/  (repo-level, about the rebuild itself)
├── AUDIT.md                  ★ legacy-app audit: tech debt + fabricated-content inventory
├── ROADMAP.md                  phased plan, prioritized tasks, Phase-4 future work
└── SOURCES.md                ★ bibliography backing every database record
```
