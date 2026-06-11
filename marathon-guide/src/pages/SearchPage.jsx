import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Panel, Breadcrumbs } from '../components/ui';
import { search, highlight } from '../lib/search';
import { useSEO } from '../lib/seo';

const TYPE_FILTERS = ['runner', 'faction', 'map', 'guide', 'news'];

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const [types, setTypes] = useState([]);
  useSEO({ title: q ? `Search: ${q}` : 'Search', description: 'Search the entire Marathon guide database.', path: '/search' });

  const results = useMemo(() => search(q, { types: types.length ? types : null, limit: 50 }), [q, types]);

  const Highlighted = ({ text }) => (
    <>
      {highlight(text, q).map((part, i) =>
        i % 2 === 1 ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>
      )}
    </>
  );

  return (
    <div className="max-w-3xl">
      <Breadcrumbs trail={[{ label: 'Search' }]} />
      <h1 className="text-2xl font-black tracking-tight mb-4">Database Search</h1>

      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
          placeholder="Search runners, factions, maps, guides, news…"
          className="w-full bg-black/60 border border-edge rounded pl-10 pr-3 py-3 text-sm font-mono focus:outline-none focus:border-neon-cyan/60 placeholder:text-slate-600"
        />
      </div>

      <div className="flex gap-1.5 mb-4 flex-wrap">
        {TYPE_FILTERS.map((t) => {
          const on = types.includes(t);
          return (
            <button
              key={t}
              onClick={() => setTypes((cur) => (on ? cur.filter((x) => x !== t) : [...cur, t]))}
              className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1.5 rounded border transition ${
                on ? 'border-neon-cyan/60 text-neon-cyan bg-neon-cyan/10' : 'border-edge text-slate-400 hover:border-slate-500'
              }`}
            >
              {t}
            </button>
          );
        })}
        {types.length > 0 && (
          <button onClick={() => setTypes([])} className="text-[10px] font-mono text-slate-500 hover:text-slate-300 px-2">clear filters</button>
        )}
      </div>

      {q.trim().length < 2 ? (
        <Panel className="p-8 text-center text-sm font-mono text-slate-500">// TYPE AT LEAST 2 CHARACTERS — try "vault", "snare", "clearance", "exfil"</Panel>
      ) : results.length === 0 ? (
        <Panel className="p-8 text-center text-sm font-mono text-slate-500">// NO RECORDS MATCH "{q}"{types.length > 0 ? ' WITH ACTIVE FILTERS' : ''}</Panel>
      ) : (
        <div className="space-y-2">
          <p className="text-[10px] font-mono text-slate-500">{results.length} result(s)</p>
          {results.map((r) => (
            <Link key={r.id} to={r.to} className="block">
              <Panel className="p-4 hover:border-slate-500 transition">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border border-edge text-neon-cyan">{r.type}</span>
                  <span className="text-sm font-bold text-slate-100"><Highlighted text={r.title} /></span>
                  <span className="text-[10px] font-mono text-slate-500 ml-auto">{r.subtitle}</span>
                </div>
                {r.snippet && <p className="text-xs text-slate-400 mt-1.5"><Highlighted text={r.snippet} /></p>}
              </Panel>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
