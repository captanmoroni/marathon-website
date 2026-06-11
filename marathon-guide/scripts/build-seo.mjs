// Generates public/sitemap.xml and public/robots.txt from the content database.
// Runs automatically before `vite build` (see package.json "build" script).
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB = path.join(__dirname, '..', 'src', 'data', 'db');
const PUBLIC = path.join(__dirname, '..', 'public');

const load = async (f) => JSON.parse(await readFile(path.join(DB, f), 'utf8'));

async function main() {
  const [meta, runners, factions, maps, guides] = await Promise.all([
    load('meta.json'), load('runners.json'), load('factions.json'), load('maps.json'), load('guides.json'),
  ]);
  const base = process.env.VITE_SITE_URL || meta.baseUrl;

  const urls = [
    { loc: '/', priority: 1.0 },
    { loc: '/guides', priority: 0.9 },
    { loc: '/runners', priority: 0.9 },
    { loc: '/factions', priority: 0.9 },
    { loc: '/maps', priority: 0.9 },
    { loc: '/planner', priority: 0.7 },
    { loc: '/compare', priority: 0.7 },
    { loc: '/news', priority: 0.8 },
    { loc: '/search', priority: 0.5 },
    ...runners.map((r) => ({ loc: `/runners/${r.slug}`, priority: 0.8, lastmod: r.lastVerified })),
    ...factions.map((r) => ({ loc: `/factions/${r.slug}`, priority: 0.8, lastmod: r.lastVerified })),
    ...maps.map((r) => ({ loc: `/maps/${r.slug}`, priority: 0.8, lastmod: r.lastVerified })),
    ...guides.map((r) => ({ loc: `/guides/${r.slug}`, priority: 0.8, lastmod: r.lastVerified })),
  ];

  const sitemap =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (u) =>
          `  <url><loc>${base}${u.loc}</loc>` +
          (u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : '') +
          `<priority>${u.priority.toFixed(1)}</priority></url>`
      )
      .join('\n') +
    `\n</urlset>\n`;

  const robots = `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${base}/sitemap.xml\n`;

  await mkdir(PUBLIC, { recursive: true });
  await writeFile(path.join(PUBLIC, 'sitemap.xml'), sitemap);
  await writeFile(path.join(PUBLIC, 'robots.txt'), robots);
  console.log(`Wrote sitemap.xml (${urls.length} urls) and robots.txt`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
