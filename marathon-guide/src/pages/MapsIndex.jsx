import { Link } from 'react-router-dom';
import { Map as MapIcon, Users, Lock } from 'lucide-react';
import { Panel, Breadcrumbs } from '../components/ui';
import { getCollection } from '../lib/db';
import { useSEO } from '../lib/seo';

export default function MapsIndex() {
  const maps = getCollection('maps');
  useSEO({ title: 'Maps & Zones', description: 'Interactive maps for every Marathon zone: Perimeter, Dire Marsh, Outpost, Night Marsh, and the Cryo Archive.', path: '/maps' });

  return (
    <div>
      <Breadcrumbs trail={[{ label: 'Maps' }]} />
      <h1 className="text-2xl font-black tracking-tight mb-1">Zones of Tau Ceti IV</h1>
      <p className="text-sm text-slate-400 mb-4">Interactive POI maps with loot, hazard, and exfil layers. POI positions are schematic, not surveyed coordinates.</p>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
        {maps.map((m) => (
          <Link key={m.id} to={`/maps/${m.slug}`}>
            <Panel className="h-full hover:border-slate-500 transition" accent={m.color}>
              <div className="h-24 relative scanline" style={{ background: `radial-gradient(ellipse at 50% 120%, ${m.color}33, transparent 70%)` }}>
                <MapIcon size={28} className="absolute bottom-3 left-4" style={{ color: m.color }} />
                <span className="absolute top-3 right-3 text-[9px] font-mono px-2 py-0.5 rounded border" style={{ color: m.color, borderColor: m.color + '55', background: m.color + '10' }}>
                  {m.difficulty.toUpperCase()}
                </span>
              </div>
              <div className="p-4">
                <h2 className="font-mono font-bold text-base" style={{ color: m.color }}>{m.name}</h2>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{m.summary}</p>
                <div className="flex items-center gap-3 mt-3 text-[10px] font-mono text-slate-500">
                  <span className="flex items-center gap-1"><Users size={10} /> {m.players}</span>
                  <span className="flex items-center gap-1"><Lock size={10} /> {m.access}</span>
                </div>
              </div>
            </Panel>
          </Link>
        ))}
      </div>
    </div>
  );
}
