// Lightweight client-side search: tokenized inverted index with field weighting,
// prefix matching, and snippet extraction. Rebuilt lazily when the CMS overlay changes.
import { COLLECTIONS, getCollection, getNews } from './db';

const tokenize = (s) =>
  (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9+.]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);

function docText(rec) {
  const fields = [];
  const push = (v, w) => v && fields.push({ text: String(v), weight: w });
  push(rec.name || rec.title, 5);
  push(rec.codename, 4);
  push(rec.role || rec.focus || rec.category, 3);
  push(rec.summary, 2);
  push(rec.prime && `${rec.prime.name} ${rec.prime.desc}`, 2);
  push(rec.tactical && `${rec.tactical.name} ${rec.tactical.desc}`, 2);
  (rec.traits || []).forEach((t) => push(t, 2));
  (rec.upgrades || []).forEach((u) => push(`${u.name} ${u.effect}`, 2));
  (rec.pois || []).forEach((p) => push(`${p.name} ${p.note}`, 2));
  (rec.body || []).forEach((b) => push(b, 1));
  (rec.tips || []).forEach((t) => push(t, 1));
  return fields;
}

let index = null;

export function buildIndex() {
  const docs = [];
  for (const [colName, col] of Object.entries(COLLECTIONS)) {
    for (const rec of getCollection(colName)) {
      docs.push({
        id: `${colName}/${rec.id}`,
        type: rec.type || colName,
        title: rec.name || rec.title,
        subtitle: rec.role || rec.focus || rec.category || rec.difficulty || '',
        to: col.route(rec),
        fields: docText(rec),
        unverified: !!rec.unverified,
      });
    }
  }
  for (const item of getNews().items) {
    docs.push({
      id: `news/${item.id}`,
      type: 'news',
      title: item.title,
      subtitle: item.date,
      to: '/news',
      fields: [
        { text: item.title, weight: 5 },
        { text: item.summary, weight: 2 },
      ],
    });
  }
  // Inverted index: token -> Map(docIdx -> score)
  const inv = new Map();
  docs.forEach((doc, di) => {
    doc.fields.forEach(({ text, weight }) => {
      tokenize(text).forEach((tok) => {
        if (!inv.has(tok)) inv.set(tok, new Map());
        const m = inv.get(tok);
        m.set(di, (m.get(di) || 0) + weight);
      });
    });
  });
  index = { docs, inv, tokens: [...inv.keys()] };
  return index;
}

export function invalidateIndex() {
  index = null;
}

if (typeof window !== 'undefined') {
  window.addEventListener('rt-db-changed', invalidateIndex);
}

function snippetFor(doc, qTokens) {
  for (const { text } of doc.fields) {
    const lower = text.toLowerCase();
    const hit = qTokens.find((t) => lower.includes(t));
    if (hit) {
      const at = lower.indexOf(hit);
      const start = Math.max(0, at - 50);
      return (start > 0 ? '…' : '') + text.slice(start, at + 110) + (at + 110 < text.length ? '…' : '');
    }
  }
  return doc.fields[1]?.text.slice(0, 120) || '';
}

export function search(query, { types = null, limit = 25 } = {}) {
  const qTokens = tokenize(query);
  if (!qTokens.length) return [];
  const { docs, inv, tokens } = index || buildIndex();
  const scores = new Map();
  for (const qt of qTokens) {
    // exact token hits score full weight; prefix hits score half
    const matches = inv.get(qt) ? [[qt, 1]] : [];
    for (const tok of tokens) {
      if (tok !== qt && tok.startsWith(qt)) matches.push([tok, 0.5]);
    }
    const perDoc = new Map();
    for (const [tok, mult] of matches) {
      for (const [di, w] of inv.get(tok)) {
        perDoc.set(di, Math.max(perDoc.get(di) || 0, w * mult));
      }
    }
    for (const [di, s] of perDoc) scores.set(di, (scores.get(di) || 0) + s);
  }
  let results = [...scores.entries()]
    .map(([di, score]) => ({ ...docs[di], score, snippet: snippetFor(docs[di], qTokens) }))
    .sort((a, b) => b.score - a.score);
  if (types?.length) results = results.filter((r) => types.includes(r.type));
  return results.slice(0, limit);
}

export function highlight(text, query) {
  const qTokens = tokenize(query);
  if (!qTokens.length) return [text];
  const re = new RegExp(`(${qTokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'ig');
  return text.split(re);
}
