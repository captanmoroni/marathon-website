import { Link } from 'react-router-dom';
import { useSEO } from '../lib/seo';

export default function NotFound() {
  useSEO({ title: '404 — Signal Lost', description: 'Page not found.', path: '/404' });
  return (
    <div className="py-20 text-center">
      <div className="font-mono text-6xl font-black text-neon-pink glow-pink">404</div>
      <p className="font-mono text-xs tracking-[0.3em] text-slate-500 mt-2">// SIGNAL LOST — RECORD NOT IN DATABASE</p>
      <div className="mt-6 flex justify-center gap-2 flex-wrap">
        <Link to="/" className="px-4 py-2 rounded border border-neon-cyan/40 text-neon-cyan font-mono text-xs uppercase tracking-wider hover:bg-neon-cyan/10">Return home</Link>
        <Link to="/search" className="px-4 py-2 rounded border border-edge text-slate-300 font-mono text-xs uppercase tracking-wider hover:bg-white/5">Search the database</Link>
      </div>
    </div>
  );
}
