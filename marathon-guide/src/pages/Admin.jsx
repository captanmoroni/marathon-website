import { useMemo, useState } from 'react';
import { Settings, Save, Trash2, Download, FileEdit, Plus, AlertTriangle } from 'lucide-react';
import { Panel, PanelHeader, Breadcrumbs, DraftBadge } from '../components/ui';
import { COLLECTIONS, getCollection, readOverlay, writeOverlay, clearOverlay } from '../lib/db';
import { useSEO } from '../lib/seo';
import { getAnalyticsBuffer, clearAnalyticsBuffer } from '../lib/analytics';
import { getErrorBuffer, clearErrorBuffer } from '../lib/monitor';

// In-browser CMS: edits are stored as a localStorage overlay on top of the shipped JSON.
// "Export" produces the merged collection JSON, ready to commit to src/data/db/.
export default function Admin() {
  const [colName, setColName] = useState('guides');
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0); // bump to re-read after writes
  useSEO({ title: 'Content Manager', description: 'Edit database records in-browser and export JSON.', path: '/admin' });

  const records = useMemo(() => getCollection(colName), [colName, version]);
  const overlay = useMemo(() => readOverlay(), [version]);
  const draftCount = Object.values(overlay).reduce((n, col) => n + Object.keys(col).length, 0);

  const startEdit = (rec) => {
    const { _draft, ...clean } = rec;
    setEditingId(rec.id);
    setDraft(JSON.stringify(clean, null, 2));
    setError('');
  };

  const startNew = () => {
    const template = { id: 'new-record', slug: 'new-record', type: colName.slice(0, -1), sources: [], lastVerified: new Date().toISOString().slice(0, 10), unverified: true };
    setEditingId('__new__');
    setDraft(JSON.stringify(template, null, 2));
    setError('');
  };

  const save = () => {
    let parsed;
    try {
      parsed = JSON.parse(draft);
    } catch (e) {
      setError(`Invalid JSON: ${e.message}`);
      return;
    }
    if (!parsed.id || !parsed.slug) {
      setError('Records require "id" and "slug" fields.');
      return;
    }
    if (!Array.isArray(parsed.sources) || parsed.sources.length === 0) {
      if (!parsed.unverified) {
        setError('Records without sources must set "unverified": true (site policy: no unsourced facts presented as fact).');
        return;
      }
    }
    const next = readOverlay();
    next[colName] = { ...(next[colName] || {}), [parsed.id]: parsed };
    writeOverlay(next);
    setEditingId(null);
    setVersion((v) => v + 1);
  };

  const discardOne = (id) => {
    const next = readOverlay();
    if (next[colName]) {
      delete next[colName][id];
      writeOverlay(next);
      setVersion((v) => v + 1);
    }
  };

  const exportJson = () => {
    const data = getCollection(colName).map(({ _draft, ...r }) => r);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${colName}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div>
      <Breadcrumbs trail={[{ label: 'Content Manager' }]} />
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2"><Settings size={20} className="text-neon-cyan" /> Content Manager</h1>
        <span className="text-[10px] font-mono text-slate-500">{draftCount} local draft(s)</span>
        {draftCount > 0 && (
          <button onClick={() => { clearOverlay(); setVersion((v) => v + 1); }} className="text-[10px] font-mono text-neon-pink border border-neon-pink/40 rounded px-2 py-1 hover:bg-neon-pink/10">
            Discard all drafts
          </button>
        )}
      </div>
      <p className="text-xs text-slate-400 mb-4 max-w-3xl">
        Edits live in your browser (localStorage overlay) and take effect immediately across the site, flagged
        <span className="mx-1"><DraftBadge /></span>. Export the merged JSON and commit it to <code className="font-mono text-neon-cyan">src/data/db/</code> to publish.
        Policy: records without sources must be marked <code className="font-mono text-neon-yellow">unverified</code>.
      </p>

      <Panel className="mb-4">
        <div className="px-4 py-2.5 flex items-center gap-4 flex-wrap text-[10px] font-mono text-slate-400">
          <span>TELEMETRY (local-only unless endpoints configured):</span>
          <span className="text-neon-cyan">{getAnalyticsBuffer().length} analytics event(s)</span>
          <button onClick={() => { clearAnalyticsBuffer(); setVersion((v) => v + 1); }} className="text-slate-500 hover:text-neon-pink underline">clear</button>
          <span className={getErrorBuffer().length ? 'text-neon-pink' : 'text-neon-green'}>{getErrorBuffer().length} captured error(s)</span>
          <button onClick={() => { clearErrorBuffer(); setVersion((v) => v + 1); }} className="text-slate-500 hover:text-neon-pink underline">clear</button>
          {getErrorBuffer().slice(-1).map((e, i) => (
            <span key={i} className="text-slate-500 truncate max-w-xs">latest: [{e.kind}] {e.message}</span>
          ))}
        </div>
      </Panel>

      <div className="flex gap-1.5 mb-4 flex-wrap">
        {Object.entries(COLLECTIONS).map(([name, col]) => (
          <button key={name} onClick={() => { setColName(name); setEditingId(null); }}
            className={`text-[11px] font-mono uppercase tracking-wider px-3 py-1.5 rounded border transition ${
              colName === name ? 'border-neon-cyan/60 text-neon-cyan bg-neon-cyan/10' : 'border-edge text-slate-400 hover:border-slate-500'
            }`}>
            {col.label}
          </button>
        ))}
        <button onClick={exportJson} className="ml-auto flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded border border-neon-green/50 text-neon-green hover:bg-neon-green/10">
          <Download size={12} /> Export {colName}.json
        </button>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-4">
        <Panel>
          <PanelHeader icon={FileEdit} title={`${COLLECTIONS[colName].label} (${records.length})`} color="#ff8a00"
            right={<button onClick={startNew} className="flex items-center gap-1 text-[10px] font-mono text-neon-green hover:underline"><Plus size={11} /> New</button>} />
          <ul className="p-2 space-y-1 max-h-[60vh] overflow-y-auto">
            {records.map((r) => (
              <li key={r.id} className="flex items-center gap-2">
                <button onClick={() => startEdit(r)}
                  className={`flex-1 text-left px-3 py-2 rounded text-xs transition ${editingId === r.id ? 'bg-neon-cyan/10 text-neon-cyan' : 'text-slate-300 hover:bg-white/5'}`}>
                  {r.name || r.title} {r._draft && <DraftBadge />}
                </button>
                {r._draft && (
                  <button onClick={() => discardOne(r.id)} title="Discard draft" className="p-1.5 text-slate-500 hover:text-neon-pink"><Trash2 size={13} /></button>
                )}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <PanelHeader icon={FileEdit} title={editingId ? `Editing: ${editingId}` : 'Select a record'} color="#00e5ff"
            right={editingId && (
              <button onClick={save} className="flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded border border-neon-green/50 text-neon-green hover:bg-neon-green/10">
                <Save size={11} /> Save draft
              </button>
            )} />
          <div className="p-3">
            {editingId ? (
              <>
                {error && (
                  <p className="mb-2 text-[11px] text-neon-pink flex items-center gap-1.5"><AlertTriangle size={12} /> {error}</p>
                )}
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  spellCheck={false}
                  className="w-full h-[55vh] bg-black/60 border border-edge rounded p-3 font-mono text-[11px] text-slate-200 focus:outline-none focus:border-neon-cyan/60 resize-y"
                />
              </>
            ) : (
              <p className="text-xs font-mono text-slate-500 py-12 text-center">// SELECT A RECORD TO EDIT, OR CREATE A NEW ONE</p>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
