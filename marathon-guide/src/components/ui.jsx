import { Link } from 'react-router-dom';
import { ChevronRight, ExternalLink, AlertTriangle, FileEdit } from 'lucide-react';

export const Panel = ({ children, className = '', accent }) => (
  <div
    className={`bg-panel border border-edge rounded-lg overflow-hidden ${className}`}
    style={accent ? { boxShadow: `0 0 0 1px ${accent}22, 0 0 24px -8px ${accent}33` } : undefined}
  >
    {children}
  </div>
);

export const PanelHeader = ({ icon: Icon, title, color = '#00e5ff', right }) => (
  <div className="flex items-center justify-between px-4 py-2.5 border-b border-edge bg-black/40">
    <div className="flex items-center gap-2">
      {Icon && <Icon size={15} style={{ color }} />}
      <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-slate-300">{title}</span>
    </div>
    {right}
  </div>
);

export const Breadcrumbs = ({ trail }) => (
  <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[11px] font-mono text-slate-500 mb-4 flex-wrap">
    <Link to="/" className="hover:text-neon-cyan">Home</Link>
    {trail.map((t, i) => (
      <span key={i} className="flex items-center gap-1">
        <ChevronRight size={11} />
        {t.to ? <Link to={t.to} className="hover:text-neon-cyan">{t.label}</Link> : <span className="text-slate-300">{t.label}</span>}
      </span>
    ))}
  </nav>
);

export const SourceList = ({ sources, lastVerified }) => (
  <div className="mt-4 pt-3 border-t border-edge">
    <div className="text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">
      Sources{lastVerified ? ` · verified ${lastVerified}` : ''}
    </div>
    <ul className="space-y-1">
      {(sources || []).map((s, i) => (
        <li key={i}>
          <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-neon-cyan">
            <ExternalLink size={10} className="shrink-0" /> {s.title}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

export const UnverifiedBadge = () => (
  <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded border border-neon-yellow/50 text-neon-yellow bg-neon-yellow/5">
    <AlertTriangle size={9} /> UNVERIFIED
  </span>
);

export const EditorialBadge = () => (
  <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded border border-neon-violet/50 text-neon-violet bg-neon-violet/5">
    OPINION
  </span>
);

export const DraftBadge = () => (
  <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded border border-neon-orange/50 text-neon-orange bg-neon-orange/5">
    <FileEdit size={9} /> LOCAL DRAFT
  </span>
);

export const StatBar = ({ label, value, max = 100, color }) => (
  <div className="mb-2">
    <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider mb-1">
      <span className="text-slate-400">{label}</span>
      <span style={{ color }}>{value}</span>
    </div>
    <div className="h-1.5 bg-black/60 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: `linear-gradient(90deg, ${color}66, ${color})`, boxShadow: `0 0 8px ${color}` }}
      />
    </div>
  </div>
);

export const RelatedLinks = ({ refs, resolve }) => {
  const items = (refs || []).map(resolve).filter(Boolean);
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-4">
      {items.map((r) => (
        <Link key={r.to} to={r.to} className="text-[10px] font-mono px-2 py-1 rounded border border-edge text-slate-300 hover:border-neon-cyan/50 hover:text-neon-cyan transition">
          {r.type.toUpperCase()} · {r.label}
        </Link>
      ))}
    </div>
  );
};
