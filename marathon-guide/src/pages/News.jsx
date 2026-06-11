import { ExternalLink, Newspaper, RefreshCw } from 'lucide-react';
import { Panel, PanelHeader, Breadcrumbs } from '../components/ui';
import { getNews } from '../lib/db';
import { useSEO } from '../lib/seo';

export default function News() {
  const news = getNews();
  useSEO({ title: 'News & Patch Coverage', description: 'Official Marathon news, sourced and dated. Ingested from official feeds.', path: '/news' });

  return (
    <div className="max-w-3xl">
      <Breadcrumbs trail={[{ label: 'News' }]} />
      <h1 className="text-2xl font-black tracking-tight mb-1">News & Patch Coverage</h1>
      <p className="text-sm text-slate-400 mb-4">
        Every item links to its original source. Feed refreshed via <code className="text-neon-cyan font-mono text-xs">npm run ingest:news</code> (official Bungie.net feed).
      </p>

      <Panel className="mb-4">
        <div className="px-4 py-2.5 flex items-center gap-2 text-[10px] font-mono text-slate-500">
          <RefreshCw size={11} className="text-neon-green" />
          Feed source: {news.feed} · last ingested {new Date(news.fetchedAt).toISOString().slice(0, 10)}
        </div>
      </Panel>

      <div className="space-y-3">
        {news.items.map((n) => (
          <Panel key={n.id}>
            <PanelHeader icon={Newspaper} title={`${n.date} · ${n.sourceName}`} color="#ff2d78" />
            <div className="p-4">
              <h2 className="text-base font-bold text-slate-100">{n.title}</h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{n.summary}</p>
              <a href={n.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-3 text-[11px] font-mono text-neon-cyan hover:underline">
                Read original <ExternalLink size={11} />
              </a>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
