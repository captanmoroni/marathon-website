import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Panel, PanelHeader, Breadcrumbs, EditorialBadge, DraftBadge } from '../components/ui';
import { getCollection } from '../lib/db';
import { useSEO } from '../lib/seo';

export default function GuidesIndex() {
  const guides = getCollection('guides');
  const categories = [...new Set(guides.map((g) => g.category))];
  useSEO({ title: 'Guides', description: 'All Marathon (2026) guides: basics, economy, endgame, seasonal coverage, and labeled editorial.', path: '/guides' });

  return (
    <div>
      <Breadcrumbs trail={[{ label: 'Guides' }]} />
      <h1 className="text-2xl font-black tracking-tight mb-4">Guide Library</h1>
      <div className="space-y-4">
        {categories.map((cat) => (
          <Panel key={cat}>
            <PanelHeader icon={BookOpen} title={cat} color="#ffe600" />
            <div className="p-3 grid md:grid-cols-2 gap-2">
              {guides.filter((g) => g.category === cat).map((g) => (
                <Link key={g.id} to={`/guides/${g.slug}`} className="rounded border border-edge bg-black/40 p-4 hover:border-slate-500 transition">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-100">{g.title}</span>
                    {g.editorial && <EditorialBadge />}
                    {g._draft && <DraftBadge />}
                  </span>
                  <span className="block text-xs text-slate-400 mt-1">{g.summary}</span>
                  <span className="block text-[9px] font-mono text-slate-600 mt-2">verified {g.lastVerified} · {g.sources?.length || 0} source(s)</span>
                </Link>
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
