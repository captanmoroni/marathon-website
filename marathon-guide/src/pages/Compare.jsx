import { useSearchParams, Link } from 'react-router-dom';
import { GitCompareArrows, Flame, Gauge, Sparkles } from 'lucide-react';
import { Panel, PanelHeader, Breadcrumbs, SourceList } from '../components/ui';
import { iconFor } from '../components/icons';
import { getCollection } from '../lib/db';
import { useSEO } from '../lib/seo';

function ShellPicker({ label, value, onChange, runners, excludeId }) {
  return (
    <label className="flex flex-col gap-1 flex-1 min-w-[180px]">
      <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-black/60 border border-edge rounded px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-neon-cyan/60"
      >
        {runners.filter((r) => r.id !== excludeId).map((r) => (
          <option key={r.id} value={r.id}>{r.name} ("{r.codename}")</option>
        ))}
      </select>
    </label>
  );
}

function ShellColumn({ r }) {
  const Icon = iconFor(r.icon);
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-3 mb-3">
        <span className="w-10 h-10 rounded grid place-items-center border shrink-0" style={{ borderColor: r.color + '66', background: r.color + '14' }}>
          <Icon size={18} style={{ color: r.color }} />
        </span>
        <div className="min-w-0">
          <Link to={`/runners/${r.slug}`} className="font-mono font-bold tracking-widest text-sm hover:underline" style={{ color: r.color }}>
            {r.name.toUpperCase()}
          </Link>
          <div className="text-[10px] font-mono text-slate-500 truncate">{r.role}</div>
        </div>
      </div>
      <dl className="space-y-3 text-xs">
        <div>
          <dt className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1"><Flame size={10} style={{ color: r.color }} /> Prime</dt>
          <dd><span className="font-bold" style={{ color: r.color }}>{r.prime.name}</span> — <span className="text-slate-400">{r.prime.desc}</span></dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1"><Gauge size={10} style={{ color: r.color }} /> Tactical</dt>
          <dd><span className="font-bold" style={{ color: r.color }}>{r.tactical.name}</span> — <span className="text-slate-400">{r.tactical.desc}</span></dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1"><Sparkles size={10} style={{ color: r.color }} /> Traits</dt>
          <dd className="space-y-1">
            {r.traits.map((t, i) => <p key={i} className="text-slate-300 bg-black/40 border border-edge rounded px-2 py-1.5">{t}</p>)}
          </dd>
        </div>
        <div>
          <dt className="text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1">Availability</dt>
          <dd className="text-slate-400 font-mono text-[11px]">{r.available}</dd>
        </div>
      </dl>
    </div>
  );
}

export default function Compare() {
  const runners = getCollection('runners');
  const [params, setParams] = useSearchParams();
  const aId = params.get('a') || 'sentinel';
  const bId = params.get('b') || 'vandal';
  const a = runners.find((r) => r.id === aId) || runners[0];
  const b = runners.find((r) => r.id === bId) || runners[1];
  useSEO({
    title: `${a.name} vs ${b.name} — Runner Comparison`,
    description: `Side-by-side comparison of ${a.name} and ${b.name}: Prime and Tactical abilities, traits, and availability.`,
    path: `/compare`,
  });

  const set = (key) => (val) => {
    const next = new URLSearchParams(params);
    next.set(key, val);
    setParams(next, { replace: true });
  };

  return (
    <div>
      <Breadcrumbs trail={[{ label: 'Runners', to: '/runners' }, { label: 'Compare' }]} />
      <h1 className="text-2xl font-black tracking-tight mb-1 flex items-center gap-2">
        <GitCompareArrows size={20} className="text-neon-cyan" /> Runner Comparison
      </h1>
      <p className="text-sm text-slate-400 mb-4">Side-by-side kit comparison from the sourced database. The URL updates as you pick — share it directly.</p>

      <Panel className="mb-4">
        <div className="p-4 flex gap-4 flex-wrap">
          <ShellPicker label="Runner A" value={a.id} onChange={set('a')} runners={runners} excludeId={b.id} />
          <ShellPicker label="Runner B" value={b.id} onChange={set('b')} runners={runners} excludeId={a.id} />
        </div>
      </Panel>

      <Panel>
        <PanelHeader icon={GitCompareArrows} title={`${a.name} vs ${b.name}`} color="#00e5ff" />
        <div className="p-5 flex flex-col md:flex-row gap-6 md:divide-x md:divide-edge">
          <ShellColumn r={a} />
          <div className="md:pl-6 flex-1 min-w-0">
            <ShellColumn r={b} />
          </div>
        </div>
        <div className="px-5 pb-4">
          <SourceList sources={[...(a.sources || []), ...(b.sources || [])].filter((s, i, arr) => arr.findIndex((x) => x.url === s.url) === i)} lastVerified={a.lastVerified} />
        </div>
      </Panel>
    </div>
  );
}
