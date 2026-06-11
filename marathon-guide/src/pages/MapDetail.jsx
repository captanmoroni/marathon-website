import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Gem, Flame, LogOut, KeyRound, MapPin, Lightbulb } from 'lucide-react';
import { Panel, PanelHeader, Breadcrumbs, SourceList, DraftBadge } from '../components/ui';
import { getRecord, getCollection } from '../lib/db';
import BookmarkButton from '../components/BookmarkButton';
import { useSEO, articleLd } from '../lib/seo';
import NotFound from './NotFound';

const KIND_META = {
  loot: { label: 'High Loot', color: '#ffe600', icon: Gem },
  hazard: { label: 'Hazards', color: '#ff2d78', icon: Flame },
  exfil: { label: 'Exfil', color: '#3dff8b', icon: LogOut },
  locked: { label: 'Locked / Gated', color: '#9d4dff', icon: KeyRound },
  poi: { label: 'POI', color: '#00e5ff', icon: MapPin },
};

function InteractiveMap({ map, layers, selected, setSelected }) {
  const pois = map.pois.filter((p) => layers[p.kind]);
  return (
    <svg viewBox="0 0 100 100" className="w-full h-auto" role="img" aria-label={`${map.name} schematic map`}>
      <defs>
        <radialGradient id="mapGlow" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor={map.color} stopOpacity="0.10" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="1" y="1" width="98" height="98" rx="3" fill="url(#mapGlow)" stroke="#1c1c2b" strokeWidth="0.4" />
      {/* schematic grid */}
      {[20, 40, 60, 80].map((v) => (
        <g key={v} stroke="#1c1c2b" strokeWidth="0.15">
          <line x1={v} y1="2" x2={v} y2="98" />
          <line x1="2" y1={v} x2="98" y2={v} />
        </g>
      ))}
      <text x="50" y="97" textAnchor="middle" fontSize="2.2" fill="#475569" fontFamily="monospace" letterSpacing="1">
        SCHEMATIC — POI POSITIONS APPROXIMATE
      </text>
      {pois.map((p) => {
        const meta = KIND_META[p.kind] || KIND_META.poi;
        const active = selected?.id === p.id;
        const toggle = () => setSelected(active ? null : p);
        return (
          <g
            key={p.id}
            onClick={toggle}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
            tabIndex={0}
            role="button"
            aria-pressed={active}
            aria-label={`${p.name} — ${meta.label}`}
            style={{ cursor: 'pointer' }}
          >
            {active && (
              <circle cx={p.x} cy={p.y} r="5.5" fill={meta.color} opacity="0.15">
                <animate attributeName="r" values="4.5;6.5;4.5" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
            <circle cx={p.x} cy={p.y} r="2.6" fill="#0b0b12" stroke={meta.color} strokeWidth={active ? 0.8 : 0.45} />
            <circle cx={p.x} cy={p.y} r="0.9" fill={meta.color} />
            <text x={p.x} y={p.y + 5.6} textAnchor="middle" fontSize="2.4" fontFamily="monospace" fill={active ? meta.color : '#94a3b8'}>
              {p.name.length > 22 ? p.name.slice(0, 20) + '…' : p.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function MapDetail() {
  const { slug } = useParams();
  const map = getRecord('maps', slug);
  const [layers, setLayers] = useState({ loot: true, hazard: true, exfil: true, locked: true, poi: true });
  const [selected, setSelected] = useState(null);
  useSEO({
    title: map ? `${map.name} — Interactive Map` : 'Map',
    description: map?.summary,
    path: `/maps/${slug}`,
    jsonLd: map ? articleLd({ title: `${map.name} Map Guide`, description: map.summary, path: `/maps/${slug}`, dateModified: map.lastVerified }) : null,
  });
  if (!map) return <NotFound />;
  const others = getCollection('maps').filter((m) => m.id !== map.id);

  return (
    <div>
      <Breadcrumbs trail={[{ label: 'Maps', to: '/maps' }, { label: map.name }]} />
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: map.color }}>{map.name} {map._draft && <DraftBadge />}</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">{map.summary}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <BookmarkButton type="map" id={map.id} title={map.name} to={`/maps/${map.slug}`} />
          <div className="text-[10px] font-mono text-slate-500 space-y-0.5 text-right">
            <div>{map.difficulty} · {map.players}</div>
            <div>{map.access}</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-4">
        <Panel accent={map.color}>
          <PanelHeader
            title={`${map.name} — Tactical Schematic`}
            color={map.color}
            right={
              <div className="flex gap-1">
                {Object.entries(KIND_META).map(([kind, meta]) => (
                  <button
                    key={kind}
                    onClick={() => setLayers((l) => ({ ...l, [kind]: !l[kind] }))}
                    className={`flex items-center gap-1 text-[9px] font-mono px-1.5 py-1 rounded border transition ${layers[kind] ? '' : 'opacity-35'}`}
                    style={{ color: meta.color, borderColor: meta.color + '55', background: layers[kind] ? meta.color + '12' : 'transparent' }}
                    title={`Toggle ${meta.label} layer`}
                  >
                    <meta.icon size={9} /> {meta.label}
                  </button>
                ))}
              </div>
            }
          />
          <div className="p-2 scanline">
            <InteractiveMap map={map} layers={layers} selected={selected} setSelected={setSelected} />
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel accent={selected ? KIND_META[selected.kind]?.color : undefined}>
            <PanelHeader icon={MapPin} title={selected ? selected.name : 'Select a POI'} color={selected ? KIND_META[selected.kind]?.color : '#475569'} />
            <div className="p-4 text-xs text-slate-300 min-h-[80px]">
              {selected ? selected.note : 'Click any marker on the schematic to read its intel note. Use the layer toggles to filter loot, hazards, exfils, and gated areas.'}
            </div>
          </Panel>
          <Panel>
            <PanelHeader icon={Lightbulb} title="Zone Tips" color="#ffe600" />
            <ul className="p-3 space-y-2">
              {(map.tips || []).map((t, i) => (
                <li key={i} className="text-xs text-slate-300 bg-black/40 border border-edge rounded px-3 py-2">{t}</li>
              ))}
              {map.id === 'cryo-archive' && (
                <li>
                  <Link to="/guides/cryo-archive-endgame" className="block text-center text-[10px] font-mono uppercase tracking-widest py-2 rounded border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10 transition">
                    Full endgame guide →
                  </Link>
                </li>
              )}
            </ul>
          </Panel>
          <Panel className="p-4">
            <SourceList sources={map.sources} lastVerified={map.lastVerified} />
          </Panel>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap mt-4">
        <Link to="/maps" className="text-[10px] font-mono px-2 py-1.5 rounded border border-edge text-slate-400 hover:text-neon-cyan flex items-center gap-1"><ChevronLeft size={11} /> All maps</Link>
        {others.map((o) => (
          <Link key={o.id} to={`/maps/${o.slug}`} className="text-[10px] font-mono px-2 py-1.5 rounded border border-edge hover:border-slate-500 transition" style={{ color: o.color }}>
            {o.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
