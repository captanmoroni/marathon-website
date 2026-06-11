import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Trophy, Newspaper, Snowflake, BookOpen, ChevronRight, Map as MapIcon, Users, Star, History, Layers, GitCompareArrows } from 'lucide-react';
import { Panel, PanelHeader, EditorialBadge, StatBar } from '../components/ui';
import { iconFor } from '../components/icons';
import { getCollection, getNews, getMeta } from '../lib/db';
import { getBookmarks, getRecent, factionDoneCount } from '../lib/prefs';
import { useSEO } from '../lib/seo';

// Personalization panel: bookmarks, recently viewed, tracked faction progress.
// Renders nothing for brand-new visitors (no local state yet).
function YourTerminal() {
  const [state, setState] = useState({ bookmarks: [], recent: [], progress: [] });

  useEffect(() => {
    const load = () => {
      const factions = getCollection('factions').filter((f) => (f.upgrades || []).length);
      setState({
        bookmarks: getBookmarks(),
        recent: getRecent().slice(0, 5),
        progress: factions
          .map((f) => ({ id: f.id, name: f.name, slug: f.slug, color: f.color, done: factionDoneCount(f.id), total: f.upgrades.length }))
          .filter((p) => p.done > 0),
      });
    };
    load();
    window.addEventListener('rt-prefs-changed', load);
    return () => window.removeEventListener('rt-prefs-changed', load);
  }, []);

  const empty = !state.bookmarks.length && !state.recent.length && !state.progress.length;
  if (empty) return null;

  return (
    <Panel accent="#ffe600">
      <PanelHeader icon={Star} title="Your Terminal" color="#ffe600"
        right={<span className="text-[9px] font-mono text-slate-500">SAVED IN YOUR BROWSER</span>} />
      <div className="p-4 grid md:grid-cols-3 gap-5">
        <div>
          <div className="text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5"><Star size={10} /> Bookmarks</div>
          {state.bookmarks.length ? (
            <ul className="space-y-1">
              {state.bookmarks.map((b) => (
                <li key={b.to}>
                  <Link to={b.to} className="text-xs text-slate-300 hover:text-neon-yellow flex items-center gap-1.5">
                    <span className="text-[8px] font-mono uppercase px-1 py-0.5 rounded border border-edge text-slate-500">{b.type}</span> {b.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : <p className="text-[11px] font-mono text-slate-600">// Save pages with the ★ button</p>}
        </div>
        <div>
          <div className="text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5"><History size={10} /> Recently viewed</div>
          {state.recent.length ? (
            <ul className="space-y-1">
              {state.recent.map((r) => (
                <li key={r.to}>
                  <Link to={r.to} className="text-xs text-slate-300 hover:text-neon-cyan flex items-center gap-1.5">
                    <span className="text-[8px] font-mono uppercase px-1 py-0.5 rounded border border-edge text-slate-500">{r.type}</span> {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : <p className="text-[11px] font-mono text-slate-600">// Browse runners, maps, guides…</p>}
        </div>
        <div>
          <div className="text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5"><Layers size={10} /> Faction progress</div>
          {state.progress.length ? (
            <div className="space-y-1">
              {state.progress.map((p) => (
                <Link key={p.id} to={`/factions/${p.slug}`} className="block">
                  <StatBar label={p.name} value={p.done} max={p.total} color={p.color} />
                </Link>
              ))}
            </div>
          ) : <p className="text-[11px] font-mono text-slate-600">// Track unlocks on faction pages</p>}
        </div>
      </div>
    </Panel>
  );
}

export default function Home() {
  const meta = getMeta();
  const runners = getCollection('runners');
  const maps = getCollection('maps');
  const news = getNews().items.slice(0, 3);
  const tierGuide = getCollection('guides').find((g) => g.id === 'shell-tier-list');

  useSEO({ description: meta.tagline, path: '/' });

  return (
    <div className="space-y-4">
      <Panel accent="#ff2d78" className="scanline">
        <div className="p-6 md:p-8 relative">
          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 80% 0%, rgba(255,45,120,.25), transparent 55%), radial-gradient(ellipse at 10% 100%, rgba(0,229,255,.2), transparent 55%)' }} />
          <div className="relative">
            <div className="text-[10px] font-mono tracking-[0.3em] text-neon-cyan mb-2">{meta.currentSeason.name.toUpperCase()} · LIVE SINCE {meta.currentSeason.started}</div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">
              TAU CETI IV, <span className="text-neon-pink glow-pink">SOURCED</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-400">
              Marathon guides with receipts: all 8 Runner shells, faction upgrade trees, interactive zone maps,
              and Cryo Archive endgame routing. Every fact cites its source; opinion is labeled as opinion.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/guides" className="flex items-center gap-1.5 px-4 py-2 bg-neon-pink/15 border border-neon-pink/50 text-neon-pink rounded font-mono text-xs uppercase tracking-wider hover:bg-neon-pink/25 transition">Browse Guides <ArrowUpRight size={13} /></Link>
              <Link to="/guides/cryo-archive-endgame" className="flex items-center gap-1.5 px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan rounded font-mono text-xs uppercase tracking-wider hover:bg-neon-cyan/20 transition">Cryo Archive Guide <Snowflake size={13} /></Link>
            </div>
          </div>
        </div>
      </Panel>

      <YourTerminal />

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel className="lg:col-span-2">
          <PanelHeader icon={Users} title="Runner Shells — Season 2 Roster" color="#00e5ff"
            right={
              <span className="flex items-center gap-3">
                <Link to="/compare" className="text-[10px] font-mono text-neon-cyan hover:underline flex items-center gap-1"><GitCompareArrows size={10} /> Compare</Link>
                <Link to="/runners" className="text-[10px] font-mono text-neon-cyan hover:underline">All runners →</Link>
              </span>
            } />
          <div className="p-3 grid sm:grid-cols-2 gap-2">
            {runners.map((r) => {
              const Icon = iconFor(r.icon);
              return (
                <Link key={r.id} to={`/runners/${r.slug}`} className="flex items-center gap-3 rounded border border-edge bg-black/40 p-3 hover:border-slate-500 transition group">
                  <span className="w-9 h-9 rounded grid place-items-center border shrink-0" style={{ borderColor: r.color + '66', background: r.color + '14' }}>
                    <Icon size={16} style={{ color: r.color }} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-mono font-bold text-xs tracking-widest" style={{ color: r.color }}>{r.name.toUpperCase()}</span>
                    <span className="block text-[10px] text-slate-500 truncate">{r.role}</span>
                  </span>
                  <ChevronRight size={14} className="ml-auto text-slate-600 group-hover:text-neon-cyan shrink-0" />
                </Link>
              );
            })}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel accent="#9d4dff">
            <PanelHeader icon={Trophy} title="S2 Tier List" color="#9d4dff" right={<EditorialBadge />} />
            <div className="p-4 text-xs text-slate-300 space-y-2">
              <p><span className="font-black text-neon-pink">S</span> — Sentinel</p>
              <p><span className="font-black text-neon-cyan">A</span> — Recon · Triage · Thief</p>
              <p><span className="font-black text-neon-green">B</span> — Vandal · Destroyer · Assassin</p>
              <p className="text-[10px] text-slate-500">Editorial ranking with reasoning and sources on the full page.</p>
              {tierGuide && (
                <Link to={`/guides/${tierGuide.slug}`} className="block w-full text-center py-2 rounded border border-neon-violet/40 text-neon-violet font-mono text-[10px] uppercase tracking-widest hover:bg-neon-violet/10 transition">Full tier list →</Link>
              )}
            </div>
          </Panel>

          <Panel>
            <PanelHeader icon={Newspaper} title="Latest News" color="#ff2d78"
              right={<Link to="/news" className="text-[10px] font-mono text-neon-cyan hover:underline">All news →</Link>} />
            <ul className="p-3 space-y-2">
              {news.map((n) => (
                <li key={n.id}>
                  <a href={n.url} target="_blank" rel="noopener noreferrer" className="block rounded border border-edge bg-black/40 px-3 py-2 hover:border-slate-500 transition">
                    <span className="block text-[9px] font-mono text-slate-500">{n.date} · {n.sourceName}</span>
                    <span className="block text-xs text-slate-200 mt-0.5">{n.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <Panel>
        <PanelHeader icon={MapIcon} title="Zones" color="#3dff8b"
          right={<Link to="/maps" className="text-[10px] font-mono text-neon-cyan hover:underline">Interactive maps →</Link>} />
        <div className="p-3 grid sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {maps.map((m) => (
            <Link key={m.id} to={`/maps/${m.slug}`} className="rounded border border-edge bg-black/40 p-3 hover:border-slate-500 transition">
              <span className="block font-mono font-bold text-xs" style={{ color: m.color }}>{m.name}</span>
              <span className="block text-[10px] text-slate-500 mt-0.5">{m.difficulty}</span>
              <span className="block text-[10px] font-mono text-slate-600 mt-1">{m.players}</span>
            </Link>
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelHeader icon={BookOpen} title="Start Here" color="#ffe600" />
        <div className="p-3 grid sm:grid-cols-3 gap-2">
          {getCollection('guides').filter((g) => ['getting-started', 'economy-priorities', 'season-2-overview'].includes(g.id)).map((g) => (
            <Link key={g.id} to={`/guides/${g.slug}`} className="rounded border border-edge bg-black/40 p-3 hover:border-slate-500 transition">
              <span className="block text-[9px] font-mono uppercase tracking-widest text-neon-yellow">{g.category}</span>
              <span className="block text-sm font-bold text-slate-200 mt-1">{g.title}</span>
              <span className="block text-[11px] text-slate-500 mt-1">{g.summary}</span>
            </Link>
          ))}
        </div>
      </Panel>
    </div>
  );
}
