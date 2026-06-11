import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, AlertTriangle } from 'lucide-react';
import { Panel, Breadcrumbs } from '../components/ui';
import { iconFor } from '../components/icons';
import { getCollection } from '../lib/db';
import { useSEO } from '../lib/seo';

export default function FactionsIndex() {
  const [query, setQuery] = useState('');
  const factions = getCollection('factions');
  useSEO({ title: 'Factions', description: 'All six Marathon factions with documented upgrade trees (CyberAcme, NuCaloric, Traxus) and sourced specializations.', path: '/factions' });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return factions;
    return factions.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.focus.toLowerCase().includes(q) ||
        (f.upgrades || []).some((u) => `${u.name} ${u.effect}`.toLowerCase().includes(q))
    );
  }, [query, factions]);

  return (
    <div>
      <Breadcrumbs trail={[{ label: 'Factions' }]} />
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Faction Progression</h1>
          <p className="text-sm text-slate-400 mt-1">Upgrade trees documented where sources exist; gaps are labeled, not invented.</p>
        </div>
        <div className="relative flex-1 sm:max-w-xs sm:ml-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search factions & unlocks…"
            className="w-full bg-black/60 border border-edge rounded pl-9 pr-3 py-2 text-xs font-mono focus:outline-none focus:border-neon-cyan/60 placeholder:text-slate-600" />
        </div>
      </div>

      {filtered.length === 0 && (
        <Panel className="p-8 text-center text-sm font-mono text-slate-500">// NO FACTION MATCHES "{query}" — try "vault", "sniper", "implant"…</Panel>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((f) => {
          const Icon = iconFor(f.icon);
          const documented = (f.upgrades || []).length;
          return (
            <Link key={f.id} to={`/factions/${f.slug}`}>
              <Panel className="p-4 h-full hover:border-slate-500 transition" accent={f.color}>
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded grid place-items-center border shrink-0" style={{ borderColor: f.color + '66', background: f.color + '14' }}>
                    <Icon size={20} style={{ color: f.color }} />
                  </span>
                  <div className="min-w-0">
                    <div className="font-mono font-bold tracking-widest text-sm" style={{ color: f.color }}>{f.name.toUpperCase()}</div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{f.focus}</p>
                  </div>
                  <ChevronRight size={15} className="ml-auto text-slate-600 shrink-0" />
                </div>
                <div className="mt-3 text-[10px] font-mono">
                  {documented > 0 ? (
                    <span className="text-neon-green">{documented} documented unlocks</span>
                  ) : (
                    <span className="text-neon-yellow flex items-center gap-1"><AlertTriangle size={10} /> tree pending public documentation</span>
                  )}
                </div>
              </Panel>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
