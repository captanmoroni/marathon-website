// Privacy-light analytics: no cookies, no fingerprinting, no third-party script.
// Pageviews and named events are buffered locally; if VITE_ANALYTICS_ENDPOINT is set,
// they are flushed via sendBeacon (fire-and-forget, works on unload).
const ENDPOINT = import.meta.env.VITE_ANALYTICS_ENDPOINT || '';
const BUFFER_KEY = 'rt-analytics-buffer-v1';
const MAX_BUFFER = 200;

const read = () => {
  try { return JSON.parse(localStorage.getItem(BUFFER_KEY)) || []; } catch { return []; }
};
const write = (events) => {
  try { localStorage.setItem(BUFFER_KEY, JSON.stringify(events.slice(-MAX_BUFFER))); } catch { /* storage full/blocked */ }
};

export function track(type, data = {}) {
  const event = { type, ...data, ts: new Date().toISOString(), ua: navigator.userAgent.slice(0, 80) };
  write([...read(), event]);
  if (ENDPOINT && navigator.sendBeacon) {
    navigator.sendBeacon(ENDPOINT, JSON.stringify(event));
  }
}

export const trackPageview = (path) => track('pageview', { path });

// For the admin page / debugging.
export const getAnalyticsBuffer = read;
export const clearAnalyticsBuffer = () => localStorage.removeItem(BUFFER_KEY);
