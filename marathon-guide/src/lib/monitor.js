// Error monitoring: captures uncaught errors, unhandled promise rejections, and
// React render errors (via ErrorBoundary) into a localStorage ring buffer.
// If VITE_ERROR_ENDPOINT is set, errors are also reported via sendBeacon.
const ENDPOINT = import.meta.env.VITE_ERROR_ENDPOINT || '';
const BUFFER_KEY = 'rt-errors-v1';
const MAX_BUFFER = 50;

const read = () => {
  try { return JSON.parse(localStorage.getItem(BUFFER_KEY)) || []; } catch { return []; }
};

export function captureError(kind, message, extra = {}) {
  const entry = {
    kind,
    message: String(message).slice(0, 500),
    path: window.location.pathname,
    ts: new Date().toISOString(),
    ...extra,
  };
  try {
    localStorage.setItem(BUFFER_KEY, JSON.stringify([...read(), entry].slice(-MAX_BUFFER)));
  } catch { /* storage blocked */ }
  if (ENDPOINT && navigator.sendBeacon) {
    navigator.sendBeacon(ENDPOINT, JSON.stringify(entry));
  }
  // Always keep errors visible in the console for local debugging.
  console.error(`[monitor:${kind}]`, message);
}

export function installGlobalErrorHandlers() {
  window.addEventListener('error', (e) => {
    captureError('uncaught', e.message, { source: `${e.filename}:${e.lineno}` });
  });
  window.addEventListener('unhandledrejection', (e) => {
    captureError('unhandledrejection', e.reason?.message || e.reason);
  });
}

export const getErrorBuffer = read;
export const clearErrorBuffer = () => localStorage.removeItem(BUFFER_KEY);
