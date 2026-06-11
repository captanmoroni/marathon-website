// Static prerendering: renders every content route to real HTML in dist/ so crawlers
// (and no-JS clients) get full markup, correct <title>, meta description, and canonical
// without executing JavaScript. The client app re-renders on load as usual.
//
// Runs after `vite build` (see package.json). Uses Vite's SSR module loader so the
// exact same components and JSON database produce the markup.
import { createServer } from 'vite';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const DB = path.join(ROOT, 'src', 'data', 'db');

const load = async (f) => JSON.parse(await readFile(path.join(DB, f), 'utf8'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

async function routesWithMeta() {
  const [meta, runners, factions, maps, guides] = await Promise.all([
    load('meta.json'), load('runners.json'), load('factions.json'), load('maps.json'), load('guides.json'),
  ]);
  const site = (t, d) => ({
    title: t ? `${t} — ${meta.siteName}` : `${meta.siteName} — ${meta.tagline}`,
    desc: d || meta.tagline,
  });
  return {
    baseUrl: process.env.VITE_SITE_URL || meta.baseUrl,
    routes: [
      { path: '/', ...site(null) },
      { path: '/guides', ...site('Guides', 'All Marathon (2026) guides: basics, economy, endgame, seasonal coverage, and labeled editorial.') },
      { path: '/runners', ...site('Runner Shells', 'All 8 Marathon Runner shells with sourced abilities, traits, and playstyle guides.') },
      { path: '/factions', ...site('Factions', 'All six Marathon factions with documented upgrade trees and sourced specializations.') },
      { path: '/maps', ...site('Maps & Zones', 'Interactive maps for every Marathon zone.') },
      { path: '/planner', ...site('Build Planner', 'Project your Marathon Runner stat sheet from documented faction upgrades and Cradle allocations.') },
      { path: '/compare', ...site('Runner Comparison', 'Compare any two Marathon Runner shells side by side: abilities, traits, and availability.') },
      { path: '/news', ...site('News & Patch Coverage', 'Official Marathon news, sourced and dated.') },
      ...runners.map((r) => ({ path: `/runners/${r.slug}`, ...site(`${r.name} ("${r.codename}") — Runner Guide`, r.summary) })),
      ...factions.map((r) => ({ path: `/factions/${r.slug}`, ...site(`${r.name} — Faction Upgrades`, r.focus) })),
      ...maps.map((r) => ({ path: `/maps/${r.slug}`, ...site(`${r.name} — Interactive Map`, r.summary) })),
      ...guides.map((r) => ({ path: `/guides/${r.slug}`, ...site(r.title, r.summary) })),
    ],
  };
}

async function main() {
  const template = await readFile(path.join(DIST, 'index.html'), 'utf8');
  const { baseUrl, routes } = await routesWithMeta();

  const vite = await createServer({
    root: ROOT,
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error',
  });

  try {
    const { render } = await vite.ssrLoadModule('/src/entry-server.jsx');
    for (const r of routes) {
      const appHtml = render(r.path);
      const html = template
        .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
        .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(r.title)}</title>`)
        .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(r.desc)}$2`)
        .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${esc(baseUrl + r.path)}$2`)
        .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(r.title)}$2`)
        .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(r.desc)}$2`);
      const outDir = path.join(DIST, r.path === '/' ? '' : r.path);
      await mkdir(outDir, { recursive: true });
      await writeFile(path.join(outDir, 'index.html'), html);
    }
    console.log(`Prerendered ${routes.length} routes into dist/`);
  } finally {
    await vite.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
