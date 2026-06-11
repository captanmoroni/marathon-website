// Personal, local-only user state: bookmarks, recently viewed, faction upgrade
// progress, and last-visit tracking. All localStorage; nothing leaves the browser.
const KEYS = {
  bookmarks: 'rt-bookmarks-v1',
  recent: 'rt-recent-v1',
  factionProgress: 'rt-faction-progress-v1',
  lastSeenNews: 'rt-last-seen-news-v1',
};

const hasStorage = typeof localStorage !== 'undefined';
const read = (key, fallback) => {
  if (!hasStorage) return fallback;
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const write = (key, value) => {
  if (!hasStorage) return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* blocked */ }
  window.dispatchEvent(new Event('rt-prefs-changed'));
};

// --- Bookmarks: [{type, id, title, to}] ---
export const getBookmarks = () => read(KEYS.bookmarks, []);
export const isBookmarked = (to) => getBookmarks().some((b) => b.to === to);
export function toggleBookmark(entry) {
  const list = getBookmarks();
  const next = list.some((b) => b.to === entry.to)
    ? list.filter((b) => b.to !== entry.to)
    : [...list, entry];
  write(KEYS.bookmarks, next);
  return next.some((b) => b.to === entry.to);
}

// --- Recently viewed: most-recent-first, capped ---
export const getRecent = () => read(KEYS.recent, []);
export function recordVisit(entry) {
  const list = getRecent().filter((r) => r.to !== entry.to);
  write(KEYS.recent, [{ ...entry, at: Date.now() }, ...list].slice(0, 8));
}

// --- Faction upgrade progress: { [factionId]: { [upgradeName]: true } } ---
export const getFactionProgress = () => read(KEYS.factionProgress, {});
export function toggleUpgrade(factionId, upgradeName) {
  const all = getFactionProgress();
  const f = { ...(all[factionId] || {}) };
  if (f[upgradeName]) delete f[upgradeName];
  else f[upgradeName] = true;
  write(KEYS.factionProgress, { ...all, [factionId]: f });
}
export const factionDoneCount = (factionId) => Object.keys(getFactionProgress()[factionId] || {}).length;

// --- "New since last visit" for news ---
export const getLastSeenNews = () => read(KEYS.lastSeenNews, null);
export const markNewsSeen = (latestDate) => write(KEYS.lastSeenNews, latestDate);
export const unseenNewsCount = (items) => {
  const last = getLastSeenNews();
  if (!last) return 0; // first visit: don't badge everything
  return items.filter((i) => i.date > last).length;
};
