import { useMemo, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Sliders, Hexagon, Layers, Activity, CheckCircle2, AlertTriangle, Share2, Check } from 'lucide-react';
import { Panel, PanelHeader, Breadcrumbs, StatBar } from '../components/ui';
import { iconFor } from '../components/icons';
import { getCollection, getMeta } from '../lib/db';
import { useSEO } from '../lib/seo';

// Documented stat-affecting faction upgrades (subset of factions.json with parseable numeric effects).
const STAT_UPGRADES = [
  { id: 'ca-scav', faction: 'CyberAcme', name: 'Scavenger.exe (R1)', stat: 'loot', amount: 5 },
  { id: 'ca-heat', faction: 'CyberAcme', name: 'Heat_Sink.exe (R2)', stat: 'heat', amount: 5 },
  { id: 'ca-rein', faction: 'CyberAcme', name: 'Reinforce.exe (R3)', stat: 'hardware', amount: 10 },
  { id: 'ca-agil', faction: 'CyberAcme', name: 'Agility_Matrix.exe (R3)', stat: 'agility', amount: 10 },
  { id: 'nc-haz1', faction: 'NuCaloric', name: 'Null_Hazard.exe (R1)', stat: 'hazard', amount: 10 },
  { id: 'nc-agil1', faction: 'NuCaloric', name: 'Agility_Matrix.exe (R2)', stat: 'agility', amount: 5 },
  { id: 'nc-rein1', faction: 'NuCaloric', name: 'Reinforce.exe (R2)', stat: 'hardware', amount: 5 },
  { id: 'nc-agil2', faction: 'NuCaloric', name: 'Agility_Matrix.exe II (R3)', stat: 'agility', amount: 5 },
  { id: 'nc-rein2', faction: 'NuCaloric', name: 'Reinforce.exe II (R3)', stat: 'hardware', amount: 5 },
  { id: 'nc-haz2', faction: 'NuCaloric', name: 'Null_Hazard.exe II (R3)', stat: 'hazard', amount: 15 },
  { id: 'tx-heat1', faction: 'Traxus', name: 'Heat_Sink.exe (R1)', stat: 'heat', amount: 5 },
  { id: 'tx-heat2', faction: 'Traxus', name: 'Heat_Sink.exe II (R3)', stat: 'heat', amount: 10 },
];

const BASE = { heat: 0, recovery: 0, loot: 0, agility: 0, hardware: 0, hazard: 0 };
const RECOVERY_CAP = 70; // Season 2 nerf: was 100%
const STORE_KEY = 'rt-planner-v1';

// Shareable permalinks: planner state <-> compact base64url JSON in ?b=
const encodeBuild = (state) =>
  btoa(JSON.stringify(state)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const decodeBuild = (s) => {
  try {
    return JSON.parse(atob(s.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
};

export default function Planner() {
  useSEO({ title: 'Build Planner', description: 'Project your Marathon Runner stat sheet from documented faction upgrades and Cradle allocations.', path: '/planner' });
  const meta = getMeta();
  const runners = getCollection('runners').filter((r) => r.id !== 'rook');
  const [params] = useSearchParams();
  const saved = useMemo(() => {
    // A shared build link (?b=) takes precedence over the locally saved build.
    const fromUrl = params.get('b') ? decodeBuild(params.get('b')) : null;
    if (fromUrl) return fromUrl;
    if (typeof localStorage === 'undefined') return {}; // build-time prerender
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [shellId, setShellId] = useState(saved.shellId || 'sentinel');
  const [picks, setPicks] = useState(saved.picks || {});
  const [cradle, setCradle] = useState(saved.cradle || { heat: 0, recovery: 0, agility: 0 });
  const [copied, setCopied] = useState(false);

  const shareBuild = async () => {
    const url = `${window.location.origin}/planner?b=${encodeBuild({ shellId, picks, cradle })}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt('Copy your build link:', url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify({ shellId, picks, cradle }));
  }, [shellId, picks, cradle]);

  const shell = runners.find((r) => r.id === shellId) || runners[0];
  const ShellIcon = iconFor(shell.icon);

  const totals = useMemo(() => {
    const t = { ...BASE };
    for (const u of STAT_UPGRADES) if (picks[u.id]) t[u.stat] += u.amount;
    t.heat += cradle.heat;
    t.agility += cradle.agility;
    t.recovery = Math.min(RECOVERY_CAP, t.recovery + cradle.recovery);
    return t;
  }, [picks, cradle]);

  const pickCount = Object.values(picks).filter(Boolean).length;

  return (
    <div>
      <Breadcrumbs trail={[{ label: 'Build Planner' }]} />
      <div className="flex items-center gap-3 flex-wrap mb-1">
        <h1 className="text-2xl font-black tracking-tight">Build Planner</h1>
        <button
          onClick={shareBuild}
          className={`flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded border transition ${
            copied ? 'border-neon-green/60 text-neon-green bg-neon-green/10' : 'border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10'
          }`}
        >
          {copied ? <Check size={12} /> : <Share2 size={12} />}
          {copied ? 'Link copied' : 'Share build link'}
        </button>
      </div>
      <p className="text-sm text-slate-400 mb-4 max-w-3xl">
        Stack documented faction stat upgrades and Cradle allocations to project your Runner's stat sheet.
        Only sourced, numeric upgrades appear here — ability/utility unlocks live on the{' '}
        <Link to="/factions" className="text-neon-cyan hover:underline">faction pages</Link>. Saved locally as you edit.
      </p>

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <div className="space-y-4">
          <Panel>
            <PanelHeader icon={Hexagon} title="Shell Chassis" color="#00e5ff" />
            <div className="p-3 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {runners.map((r) => {
                const Icon = iconFor(r.icon);
                const on = shellId === r.id;
                return (
                  <button key={r.id} onClick={() => setShellId(r.id)}
                    className={`rounded border p-2.5 flex flex-col items-center gap-1.5 transition ${on ? '' : 'border-edge bg-black/40 hover:border-slate-600'}`}
                    style={on ? { borderColor: r.color, background: r.color + '12' } : undefined}>
                    <Icon size={16} style={{ color: r.color }} />
                    <span className="font-mono text-[9px] tracking-widest" style={{ color: on ? r.color : '#94a3b8' }}>{r.name.toUpperCase()}</span>
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel>
            <PanelHeader icon={Layers} title="Documented Faction Stat Upgrades" color="#ff8a00"
              right={<span className="text-[9px] font-mono text-slate-500">{pickCount}/{STAT_UPGRADES.length} SLOTTED</span>} />
            <div className="p-3 grid sm:grid-cols-2 gap-2">
              {STAT_UPGRADES.map((u) => {
                const on = !!picks[u.id];
                const statMeta = meta.stats.find((s) => s.key === u.stat);
                return (
                  <button key={u.id} onClick={() => setPicks((p) => ({ ...p, [u.id]: !p[u.id] }))}
                    className={`flex items-center gap-3 rounded border p-3 text-left transition ${on ? 'border-neon-orange/70 bg-neon-orange/10' : 'border-edge bg-black/40 hover:border-slate-600'}`}>
                    <CheckCircle2 size={15} className={on ? 'text-neon-orange' : 'text-slate-700'} />
                    <span className="min-w-0">
                      <span className={`block text-xs font-semibold ${on ? 'text-neon-orange' : 'text-slate-300'}`}>{u.faction} · {u.name}</span>
                      <span className="block text-[10px] text-slate-500">{statMeta?.label} +{u.amount}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel>
            <PanelHeader icon={Sliders} title="The Cradle — Baseline Stat Allocation (S2)" color="#3dff8b" />
            <div className="p-4 space-y-5">
              {[
                { key: 'heat', label: 'Heat Capacity', color: '#ff2d78', max: 30 },
                { key: 'recovery', label: 'Recovery (% recharge bonus)', color: '#00e5ff', max: RECOVERY_CAP },
                { key: 'agility', label: 'Agility', color: '#ffe600', max: 30 },
              ].map((s) => (
                <div key={s.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-300">{s.label}</span>
                    <span className="font-mono text-sm font-bold" style={{ color: s.color }}>+{cradle[s.key]}</span>
                  </div>
                  <input type="range" min="0" max={s.max} value={cradle[s.key]}
                    onChange={(e) => setCradle((c) => ({ ...c, [s.key]: +e.target.value }))} className="w-full" />
                </div>
              ))}
              <p className="text-[10px] font-mono text-slate-500 flex items-start gap-1.5">
                <AlertTriangle size={11} className="text-neon-yellow shrink-0 mt-0.5" />
                Recovery is hard-capped at +{RECOVERY_CAP}% since Season 2 (down from +100%). Cradle allocation ranges
                are illustrative — Bungie hasn't published exact point budgets.
              </p>
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel accent={shell.color}>
            <PanelHeader icon={Activity} title="Projected Stat Sheet" color={shell.color} />
            <div className="p-4">
              <div className="text-center mb-4">
                <span className="inline-grid place-items-center w-12 h-12 rounded border mb-2" style={{ borderColor: shell.color + '66', background: shell.color + '14' }}>
                  <ShellIcon size={20} style={{ color: shell.color }} />
                </span>
                <div className="font-mono text-sm font-bold" style={{ color: shell.color }}>{shell.name.toUpperCase()} CHASSIS</div>
                <div className="text-[10px] font-mono text-slate-500 mt-0.5">{shell.role}</div>
              </div>
              <StatBar label="Heat Capacity" value={totals.heat} max={50} color="#ff2d78" />
              <StatBar label={`Recovery (cap ${RECOVERY_CAP}%)`} value={totals.recovery} max={RECOVERY_CAP} color="#00e5ff" />
              <StatBar label="Loot Speed" value={totals.loot} max={20} color="#ffe600" />
              <StatBar label="Agility" value={totals.agility} max={50} color="#3dff8b" />
              <StatBar label="Hardware" value={totals.hardware} max={30} color="#9d4dff" />
              <StatBar label="Hazard Tolerance" value={totals.hazard} max={30} color="#ff8a00" />
              <div className="mt-3 pt-3 border-t border-edge">
                <div className="text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">Active upgrades</div>
                {STAT_UPGRADES.filter((u) => picks[u.id]).map((u) => (
                  <div key={u.id} className="text-[11px] text-neon-orange flex items-center gap-1.5"><CheckCircle2 size={10} /> {u.faction} {u.name}</div>
                ))}
                {pickCount === 0 && <div className="text-[11px] font-mono text-slate-600">// none slotted</div>}
              </div>
            </div>
          </Panel>
          <Panel className="p-3 text-[10px] font-mono text-slate-500 leading-relaxed">
            Numbers shown are the documented upgrade values from faction trees (see sources on each faction page)
            plus your hypothetical Cradle spread — not a damage simulator.
          </Panel>
        </div>
      </div>
    </div>
  );
}
