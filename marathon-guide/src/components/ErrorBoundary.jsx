import { Component } from 'react';
import { captureError } from '../lib/monitor';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    captureError('react-render', error?.message || error, { componentStack: (info?.componentStack || '').slice(0, 400) });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="py-20 text-center">
          <div className="font-mono text-4xl font-black text-neon-pink glow-pink">RENDER FAULT</div>
          <p className="font-mono text-xs tracking-[0.3em] text-slate-400 mt-2">// THIS VIEW CRASHED — THE ERROR WAS LOGGED</p>
          <p className="font-mono text-[11px] text-slate-500 mt-3 max-w-md mx-auto break-words">{String(this.state.error?.message || this.state.error)}</p>
          <div className="mt-6 flex justify-center gap-2">
            <button onClick={() => this.setState({ error: null })} className="px-4 py-2 rounded border border-neon-cyan/40 text-neon-cyan font-mono text-xs uppercase tracking-wider hover:bg-neon-cyan/10">Retry</button>
            <a href="/" className="px-4 py-2 rounded border border-edge text-slate-300 font-mono text-xs uppercase tracking-wider hover:bg-white/5">Home</a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
