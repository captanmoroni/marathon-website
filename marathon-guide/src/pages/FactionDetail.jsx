import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, AlertTriangle, Lightbulb, CheckCircle2, Circle } from 'lucide-react';
import { Panel, PanelHeader, Breadcrumbs, SourceList, DraftBadge, StatBar } from '../components/ui';
import { iconFor } from '../components/icons';
import { getRecord, getCollection } from '../lib/db';
import { getFactionProgress, toggleUpgrade } from '../lib/prefs';
import { useSEO, articleLd } from '../lib/seo';
import BookmarkButton from '../components/BookmarkButton';
import NotFound from './NotFound';

export default function FactionDetail() {
  const { slug } = useParams();
  const f = getRecord('factions', slug);
  const [, bump] = useState(0); // re-render after progress toggles
  useSEO({
    title: f ? `${f.name} — Faction Upgrades` : 'Faction',
    description: f?.focus,
    path: `/factions/${slug}`,
    jsonLd: f ? articleLd({ title: `${f.name} Faction Guide`, description: f.focus, path: `/factions/${slug}`, dateModified: f.lastVerified }) : null,
  });
  if (!f) return <NotFound />;
  const Icon = iconFor(f.icon);
  const ranks = [...new Set((f.upgrades || []).map((u) => u.rank))].sort();
  const others = getCollection('factions').filter((o) => o.id !== f.id);
  const progress = getFactionProgress()[f.id] || {};
  const doneCount = Object.keys(progress).length;
  const total = (f.upgrades || []).length;

  return (
    <div>
      <Breadcrumbs trail={[{ label: 'Factions', to: '/factions' }, { label: f.name }]} />
      <div className="space-y-4">
        <Panel accent={f.color}>
          <div className="p-5 flex items-start gap-4 flex-wrap">
            <span className="w-12 h-12 rounded grid place-items-center border shrink-0" style={{ borderColor: f.color + '66', background: f.color + '14' }}>
              <Icon size={22} style={{ color: f.color }} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black tracking-widest" style={{ color: f.color }}>{f.name.toUpperCase()} {f._draft && <DraftBadge />}</h1>
                <span className="ml-auto"><BookmarkButton type="faction" id={f.id} title={f.name} to={`/factions/${f.slug}`} /></span>
              </div>
              <p className="text-sm text-slate-300 mt-1">{f.focus}</p>
              <p className="text-xs text-slate-400 mt-2 flex items-start gap-1.5"><Lightbulb size={13} className="shrink-0 mt-0.5 text-neon-yellow" /> {f.recommendation}</p>
              {total > 0 && (
                <div className="mt-4 max-w-sm">
                  <StatBar label="Your tracked progress" value={doneCount} max={total} color={f.color} />
                  <p className="text-[10px] font-mono text-slate-500">{doneCount}/{total} unlocks checked off — saved in your browser. Click any unlock below to track it.</p>
                </div>
              )}
            </div>
          </div>
        </Panel>

        {ranks.length > 0 ? (
          ranks.map((rank) => (
            <Panel key={rank}>
              <PanelHeader title={`Rank ${rank} Unlocks`} color={f.color}
                right={<span className="text-[9px] font-mono text-slate-500">
                  {f.upgrades.filter((u) => u.rank === rank && progress[u.name]).length}/{f.upgrades.filter((u) => u.rank === rank).length} DONE
                </span>} />
              <div className="p-3 grid md:grid-cols-2 gap-2">
                {f.upgrades.filter((u) => u.rank === rank).map((u, i) => {
                  const done = !!progress[u.name];
                  return (
                    <button
                      key={i}
                      onClick={() => { toggleUpgrade(f.id, u.name); bump((n) => n + 1); }}
                      aria-pressed={done}
                      className={`text-left flex items-start gap-2.5 rounded px-3 py-2.5 border transition ${
                        done ? 'border-neon-green/40 bg-neon-green/5' : 'border-edge bg-black/40 hover:border-slate-600'
                      }`}
                    >
                      {done
                        ? <CheckCircle2 size={15} className="text-neon-green shrink-0 mt-0.5" />
                        : <Circle size={15} className="text-slate-600 shrink-0 mt-0.5" />}
                      <span>
                        <span className={`block font-mono text-xs font-bold ${done ? 'text-slate-500 line-through' : ''}`} style={done ? {} : { color: f.color }}>{u.name}</span>
                        <span className={`block text-xs mt-0.5 ${done ? 'text-slate-500' : 'text-slate-300'}`}>{u.effect}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </Panel>
          ))
        ) : (
          <Panel className="p-5">
            <p className="text-sm text-neon-yellow flex items-center gap-2"><AlertTriangle size={15} /> Upgrade tree not yet publicly documented</p>
            <p className="text-xs text-slate-400 mt-2">{f.upgradesNote}</p>
          </Panel>
        )}

        <Panel className="p-4">
          <SourceList sources={f.sources} lastVerified={f.lastVerified} />
        </Panel>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Link to="/factions" className="text-[10px] font-mono px-2 py-1.5 rounded border border-edge text-slate-400 hover:text-neon-cyan flex items-center gap-1"><ChevronLeft size={11} /> All factions</Link>
          {others.map((o) => (
            <Link key={o.id} to={`/factions/${o.slug}`} className="text-[10px] font-mono px-2 py-1.5 rounded border border-edge hover:border-slate-500 transition" style={{ color: o.color }}>
              {o.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
