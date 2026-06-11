// Content database access layer.
// Base records ship as JSON; the CMS writes a draft overlay to localStorage which
// takes precedence at read time, so editors preview changes without a rebuild.
import runnersBase from '../data/db/runners.json';
import factionsBase from '../data/db/factions.json';
import mapsBase from '../data/db/maps.json';
import guidesBase from '../data/db/guides.json';
import newsBase from '../data/db/news.json';
import meta from '../data/db/meta.json';

const OVERLAY_KEY = 'rt-cms-overlay-v1';

export const COLLECTIONS = {
  runners: { label: 'Runners', base: runnersBase, route: (r) => `/runners/${r.slug}` },
  factions: { label: 'Factions', base: factionsBase, route: (r) => `/factions/${r.slug}` },
  maps: { label: 'Maps', base: mapsBase, route: (r) => `/maps/${r.slug}` },
  guides: { label: 'Guides', base: guidesBase, route: (r) => `/guides/${r.slug}` },
};

// localStorage is absent during build-time prerendering (Node); fall back to empty overlay.
const hasStorage = typeof localStorage !== 'undefined';

export function readOverlay() {
  if (!hasStorage) return {};
  try {
    return JSON.parse(localStorage.getItem(OVERLAY_KEY)) || {};
  } catch {
    return {};
  }
}

export function writeOverlay(overlay) {
  localStorage.setItem(OVERLAY_KEY, JSON.stringify(overlay));
  window.dispatchEvent(new Event('rt-db-changed'));
}

export function clearOverlay() {
  localStorage.removeItem(OVERLAY_KEY);
  window.dispatchEvent(new Event('rt-db-changed'));
}

export function getCollection(name) {
  const col = COLLECTIONS[name];
  if (!col) return [];
  const overlay = readOverlay()[name] || {};
  const merged = col.base.map((rec) => (overlay[rec.id] ? { ...rec, ...overlay[rec.id], _draft: true } : rec));
  const newIds = Object.keys(overlay).filter((id) => !col.base.some((r) => r.id === id));
  return merged.concat(newIds.map((id) => ({ ...overlay[id], id, _draft: true })));
}

export function getRecord(name, slug) {
  return getCollection(name).find((r) => r.slug === slug || r.id === slug) || null;
}

export function getNews() {
  return newsBase;
}

export function getMeta() {
  return meta;
}

// Resolve "type:id" related-content refs (e.g. "runner:sentinel") to {label, to}.
const REF_ROUTES = {
  runner: (id) => ({ col: 'runners', to: `/runners/${id}` }),
  faction: (id) => ({ col: 'factions', to: `/factions/${id}` }),
  map: (id) => ({ col: 'maps', to: `/maps/${id}` }),
  guide: (id) => ({ col: 'guides', to: `/guides/${id}` }),
};

export function resolveRef(ref) {
  const [type, id] = ref.split(':');
  const r = REF_ROUTES[type]?.(id);
  if (!r) return null;
  const rec = getRecord(r.col, id);
  return rec ? { label: rec.name || rec.title, to: r.to, type } : null;
}
