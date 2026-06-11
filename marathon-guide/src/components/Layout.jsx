import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { Hexagon, Zap, Search, Menu, X, Activity, BookOpen, Users, Layers, Map as MapIcon, Sliders, Newspaper, Settings } from 'lucide-react';
import { getMeta, getNews } from '../lib/db';
import { search } from '../lib/search';
import { trackPageview } from '../lib/analytics';
import { unseenNewsCount, markNewsSeen } from '../lib/prefs';

const NAV = [
  { to: '/', label: 'Home', icon: Activity, end: true },
  { to: '/guides', label: 'Guides', icon: BookOpen },
  { to: '/runners', label: 'Runners', icon: Users },
  { to: '/factions', label: 'Factions', icon: Layers },
  { to: '/maps', label: 'Maps', icon: MapIcon },
  { to: '/planner', label: 'Planner', icon: Sliders },
  { to: '/news', label: 'News', icon: Newspaper },
];

function QuickSearch() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [hi, setHi] = useState(0);
  const nav = useNavigate();
  const boxRef = useRef(null);

  useEffect(() => {
    if (q.trim().length >= 2) {
      setResults(search(q, { limit: 7 }));
      setOpen(true);
      setHi(0);
    } else {
      setOpen(false);
    }
  }, [q]);

  useEffect(() => {
    const onClick = (e) => !boxRef.current?.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const go = (to) => {
    setOpen(false);
    setQ('');
    nav(to);
  };

  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHi((h) => Math.min(h + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && results[hi]) go(results[hi].to);
      else if (q.trim()) go(`/search?q=${encodeURIComponent(q)}`);
    } else if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div ref={boxRef} className="relative w-full sm:w-64">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={onKey}
        placeholder="Search database… (Enter for full search)"
        aria-label="Search the database"
        className="w-full bg-black/60 border border-edge rounded pl-9 pr-3 py-2 text-xs font-mono focus:outline-none focus:border-neon-cyan/60 placeholder:text-slate-600"
      />
      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-panel border border-edge rounded-lg shadow-2xl shadow-black z-50 overflow-hidden">
          {results.length === 0 && (
            <div className="px-3 py-3 text-[11px] font-mono text-slate-500">No matches.</div>
          )}
          {results.map((r, i) => (
            <button
              key={r.id}
              onMouseEnter={() => setHi(i)}
              onClick={() => go(r.to)}
              className={`w-full text-left px-3 py-2 flex items-center gap-2 text-xs ${i === hi ? 'bg-neon-cyan/10' : ''}`}
            >
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border border-edge text-neon-cyan shrink-0">{r.type}</span>
              <span className="text-slate-200 truncate">{r.title}</span>
              <span className="text-slate-500 truncate text-[10px] ml-auto">{r.subtitle}</span>
            </button>
          ))}
          {results.length > 0 && (
            <button onClick={() => go(`/search?q=${encodeURIComponent(q)}`)} className="w-full text-left px-3 py-2 text-[10px] font-mono text-neon-cyan border-t border-edge hover:bg-neon-cyan/10">
              View all results →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newsBadge, setNewsBadge] = useState(0);
  const meta = getMeta();
  const { pathname } = useLocation();

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo(0, 0);
    trackPageview(pathname);
    // Move focus to the main landmark so screen-reader/keyboard users land on the new page content.
    document.getElementById('content')?.focus({ preventScroll: true });
    // "New since last visit" badge on the News tab; visiting /news marks everything seen.
    const items = getNews().items;
    if (pathname === '/news' && items.length) {
      markNewsSeen(items[0].date);
      setNewsBadge(0);
    } else {
      setNewsBadge(unseenNewsCount(items));
    }
  }, [pathname]);

  return (
    <div className="min-h-screen bg-void flex flex-col">
      <a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-neon-cyan focus:text-black focus:rounded focus:font-mono focus:text-xs">
        Skip to content
      </a>
      <header className="sticky top-0 z-50 bg-void/95 backdrop-blur border-b border-edge">
        <div className="bg-black/60 border-b border-edge px-4 py-1 flex items-center gap-3 overflow-x-auto whitespace-nowrap text-[10px] font-mono">
          <span className="flex items-center gap-1.5 text-neon-green shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" /> {meta.currentSeason.name}
          </span>
          <span className="text-slate-400 shrink-0">{meta.currentSeason.headline}</span>
          <span className="text-slate-600 shrink-0">since {meta.currentSeason.started}</span>
          <Link to="/news" className="text-neon-cyan hover:underline shrink-0 ml-auto">Patch coverage →</Link>
        </div>
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-3 py-2.5">
          <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="Runner Terminal home">
            <span className="relative w-8 h-8 grid place-items-center">
              <Hexagon size={32} className="text-neon-pink absolute" strokeWidth={1.5} />
              <Zap size={14} className="text-neon-cyan relative" />
            </span>
            <span className="leading-tight hidden md:block">
              <span className="block font-mono font-bold tracking-widest text-sm">RUNNER<span className="text-neon-pink glow-pink">TERMINAL</span></span>
              <span className="block text-[9px] font-mono text-slate-500 tracking-[0.25em]">MARATHON 2026 // SOURCED DATABASE</span>
            </span>
          </Link>
          <nav className="hidden lg:flex gap-1" aria-label="Primary">
            {NAV.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded text-[11px] font-mono uppercase tracking-wider transition border ${
                    isActive ? 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/40' : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                  }`
                }
              >
                <t.icon size={13} /> {t.label}
                {t.to === '/news' && newsBadge > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-neon-pink/20 border border-neon-pink/50 text-neon-pink text-[9px] leading-none" aria-label={`${newsBadge} new articles`}>
                    {newsBadge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 flex-1 sm:flex-none justify-end">
            <QuickSearch />
            <Link to="/admin" aria-label="Content manager" title="Content manager" className="p-2 rounded text-slate-500 hover:text-neon-cyan hover:bg-white/5"><Settings size={15} /></Link>
            <button className="lg:hidden p-2 rounded text-slate-300 hover:bg-white/5" onClick={() => setMobileOpen((o) => !o)} aria-label="Toggle navigation">
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <nav className="lg:hidden border-t border-edge px-4 py-2 grid grid-cols-2 gap-1 bg-panel" aria-label="Mobile">
            {NAV.map((t) => (
              <NavLink key={t.to} to={t.to} end={t.end}
                className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 rounded text-xs font-mono uppercase tracking-wider ${isActive ? 'bg-neon-cyan/10 text-neon-cyan' : 'text-slate-300'}`}>
                <t.icon size={14} /> {t.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main id="content" tabIndex={-1} className="max-w-7xl mx-auto px-4 py-5 w-full flex-1 outline-none">{children}</main>

      <footer className="border-t border-edge py-5 text-center space-y-1">
        <p className="text-[10px] font-mono text-slate-400 tracking-widest">
          RUNNER TERMINAL // UNOFFICIAL FAN DATABASE — MARATHON © BUNGIE · NO AFFILIATION
        </p>
        <p className="text-[10px] font-mono text-slate-400">
          Every fact cites a source · editorial opinion is labeled · <Link to="/news" className="text-slate-300 underline hover:text-neon-cyan">data updated {getMeta().currentSeason.started}+</Link>
        </p>
      </footer>
    </div>
  );
}
