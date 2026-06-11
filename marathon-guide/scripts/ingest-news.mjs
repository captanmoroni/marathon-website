// Automated official news ingestion.
// Pulls the Bungie.net news RSS feed, filters for Marathon items, and rewrites
// src/data/db/news.json. Existing seeded items are kept (deduped by URL) so the
// page never regresses to empty if the feed is unreachable.
//
// Usage: npm run ingest:news
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NEWS_PATH = path.join(__dirname, '..', 'src', 'data', 'db', 'news.json');
const FEED_URL = 'https://www.bungie.net/en/rss/News';

const decodeEntities = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");

const absolutize = (url) => (url.startsWith('/') ? `https://www.bungie.net${url}` : url);

function parseRss(xml) {
  const items = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  const tag = (block, name) => {
    const m = block.match(new RegExp(`<${name}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${name}>`));
    return m ? m[1].trim() : '';
  };
  let m;
  while ((m = itemRe.exec(xml))) {
    const block = m[1];
    items.push({
      title: decodeEntities(tag(block, 'title')),
      url: absolutize(tag(block, 'link')),
      summary: decodeEntities(tag(block, 'description').replace(/<[^>]+>/g, '')).slice(0, 300),
      date: new Date(tag(block, 'pubDate') || Date.now()).toISOString().slice(0, 10),
    });
  }
  return items;
}

async function main() {
  const current = JSON.parse(await readFile(NEWS_PATH, 'utf8'));
  let fetched = [];
  let feedLabel = current.feed;

  try {
    const res = await fetch(FEED_URL, { headers: { 'user-agent': 'runner-terminal-news-ingest/1.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    fetched = parseRss(xml)
      .filter((i) => /marathon/i.test(`${i.title} ${i.summary}`))
      .map((i, idx) => ({
        id: `bungie-${i.date}-${idx}`,
        date: i.date,
        title: i.title,
        summary: i.summary,
        url: i.url,
        sourceName: 'Bungie.net',
      }));
    feedLabel = FEED_URL;
    console.log(`Fetched ${fetched.length} Marathon item(s) from Bungie.net feed.`);
  } catch (err) {
    console.warn(`Feed unavailable (${err.message}); keeping existing items.`);
  }

  // Normalize previously ingested items too (handles entries written before fixes).
  const normalized = current.items.map((i) => ({
    ...i,
    title: decodeEntities(i.title),
    summary: decodeEntities(i.summary),
    url: absolutize(i.url),
  }));
  const seen = new Set();
  const merged = [...fetched, ...normalized]
    .filter((i) => (seen.has(`${i.date}|${i.title}`) ? false : seen.add(`${i.date}|${i.title}`)))
    .sort((a, b) => b.date.localeCompare(a.date));

  const out = {
    fetchedAt: new Date().toISOString(),
    feed: feedLabel,
    note: 'Merged official-feed items with seeded sourced entries. Re-run `npm run ingest:news` to refresh.',
    items: merged,
  };
  await writeFile(NEWS_PATH, JSON.stringify(out, null, 2) + '\n');
  console.log(`Wrote ${merged.length} item(s) to ${path.relative(process.cwd(), NEWS_PATH)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
