import { useParams, Link } from 'react-router-dom';
import { Flame, Gauge, Sparkles, Lightbulb, AlertTriangle, ChevronLeft } from 'lucide-react';
import { Panel, PanelHeader, Breadcrumbs, SourceList, DraftBadge } from '../components/ui';
import { iconFor } from '../components/icons';
import { getRecord, getCollection } from '../lib/db';
import BookmarkButton from '../components/BookmarkButton';
import { useSEO, articleLd } from '../lib/seo';
import NotFound from './NotFound';

export default function RunnerDetail() {
  const { slug } = useParams();
  const r = getRecord('runners', slug);
  useSEO({
    title: r ? `${r.name} ("${r.codename}") — Runner Guide` : 'Runner',
    description: r?.summary,
    path: `/runners/${slug}`,
    jsonLd: r ? articleLd({ title: `${r.name} Runner Guide`, description: r.summary, path: `/runners/${slug}`, dateModified: r.lastVerified }) : null,
  });
  if (!r) return <NotFound />;
  const Icon = iconFor(r.icon);
  const others = getCollection('runners').filter((o) => o.id !== r.id);

  return (
    <div>
      <Breadcrumbs trail={[{ label: 'Runners', to: '/runners' }, { label: r.name }]} />
      <div className="space-y-4">
        <Panel accent={r.color}>
          <div className="p-5 relative scanline">
            <div className="absolute inset-0 opacity-25 pointer-events-none" style={{ background: `radial-gradient(ellipse at 90% 10%, ${r.color}33, transparent 60%)` }} />
            <div className="relative">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="w-12 h-12 rounded grid place-items-center border" style={{ borderColor: r.color + '66', background: r.color + '14' }}>
                  <Icon size={22} style={{ color: r.color }} />
                </span>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black tracking-widest" style={{ color: r.color, textShadow: `0 0 16px ${r.color}88` }}>
                    {r.name.toUpperCase()}
                  </h1>
                  <p className="text-[11px] font-mono text-slate-500">"{r.codename}" · {r.available}</p>
                </div>
                {r._draft && <DraftBadge />}
                <span className="ml-auto"><BookmarkButton type="runner" id={r.id} title={r.name} to={`/runners/${r.slug}`} /></span>
              </div>
              <p className="text-sm text-slate-300 mt-3 max-w-2xl">{r.summary}</p>
              <p className="text-xs font-mono text-slate-500 mt-2">{r.role}</p>
              {r.restrictions && (
                <p className="mt-3 text-xs text-neon-yellow flex items-center gap-1.5"><AlertTriangle size={13} /> {r.restrictions}</p>
              )}
            </div>
          </div>
        </Panel>

        <div className="grid md:grid-cols-2 gap-4">
          <Panel>
            <PanelHeader icon={Flame} title="Prime Ability" color={r.color} />
            <div className="p-4">
              <div className="font-bold text-sm mb-1" style={{ color: r.color }}>{r.prime.name}</div>
              <p className="text-xs text-slate-400">{r.prime.desc}</p>
            </div>
          </Panel>
          <Panel>
            <PanelHeader icon={Gauge} title="Tactical Ability" color={r.color} />
            <div className="p-4">
              <div className="font-bold text-sm mb-1" style={{ color: r.color }}>{r.tactical.name}</div>
              <p className="text-xs text-slate-400">{r.tactical.desc}</p>
            </div>
          </Panel>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Panel>
            <PanelHeader icon={Sparkles} title="Traits & Passives" color="#ff8a00" />
            <ul className="p-3 space-y-2">
              {r.traits.map((t, i) => (
                <li key={i} className="text-xs text-slate-300 bg-black/40 border border-edge rounded px-3 py-2">{t}</li>
              ))}
            </ul>
          </Panel>
          <Panel>
            <PanelHeader icon={Lightbulb} title="Playstyle Tips (Editorial)" color="#ffe600" />
            <ul className="p-3 space-y-2">
              {(r.tips || []).map((t, i) => (
                <li key={i} className="text-xs text-slate-300 bg-black/40 border border-edge rounded px-3 py-2">{t}</li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel className="p-4">
          <SourceList sources={r.sources} lastVerified={r.lastVerified} />
        </Panel>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Link to="/runners" className="text-[10px] font-mono px-2 py-1.5 rounded border border-edge text-slate-400 hover:text-neon-cyan flex items-center gap-1"><ChevronLeft size={11} /> All runners</Link>
          {others.map((o) => (
            <Link key={o.id} to={`/runners/${o.slug}`} className="text-[10px] font-mono px-2 py-1.5 rounded border border-edge hover:border-slate-500 transition" style={{ color: o.color }}>
              {o.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
