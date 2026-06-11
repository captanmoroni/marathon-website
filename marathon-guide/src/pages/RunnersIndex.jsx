import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Panel, Breadcrumbs, DraftBadge } from '../components/ui';
import { iconFor } from '../components/icons';
import { getCollection } from '../lib/db';
import { useSEO } from '../lib/seo';

export default function RunnersIndex() {
  const runners = getCollection('runners');
  useSEO({ title: 'Runner Shells', description: 'All 8 Marathon Runner shells with sourced abilities, traits, and playstyle guides.', path: '/runners' });

  return (
    <div>
      <Breadcrumbs trail={[{ label: 'Runners' }]} />
      <h1 className="text-2xl font-black tracking-tight mb-1">Runner Shells</h1>
      <p className="text-sm text-slate-400 mb-2 max-w-2xl">
        Seven shells plus the Rook scavenger mode. Ability data sourced per shell; tier placements live in the
        labeled-editorial <Link to="/guides/shell-tier-list" className="text-neon-cyan hover:underline">tier list</Link>.
      </p>
      <Link to="/compare" className="inline-flex items-center gap-1.5 mb-4 text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10 transition">
        Compare two runners side-by-side →
      </Link>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {runners.map((r) => {
          const Icon = iconFor(r.icon);
          return (
            <Link key={r.id} to={`/runners/${r.slug}`}>
              <Panel className="p-4 h-full hover:border-slate-500 transition" accent={r.color}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-10 h-10 rounded grid place-items-center border shrink-0" style={{ borderColor: r.color + '66', background: r.color + '14' }}>
                    <Icon size={18} style={{ color: r.color }} />
                  </span>
                  <div className="min-w-0">
                    <div className="font-mono font-bold tracking-widest text-sm" style={{ color: r.color }}>{r.name.toUpperCase()}</div>
                    <div className="text-[10px] font-mono text-slate-500">"{r.codename}"</div>
                  </div>
                  <ChevronRight size={15} className="ml-auto text-slate-600" />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{r.role}</p>
                <p className="text-[10px] font-mono text-slate-600 mt-2">{r.available}</p>
                {r._draft && <div className="mt-2"><DraftBadge /></div>}
              </Panel>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
