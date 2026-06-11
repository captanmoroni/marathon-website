import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { isBookmarked, toggleBookmark, recordVisit } from '../lib/prefs';

// Star-toggle for any record page. Also records the visit for "recently viewed".
export default function BookmarkButton({ type, id, title, to }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isBookmarked(to));
    recordVisit({ type, id, title, to });
  }, [to, type, id, title]);

  return (
    <button
      onClick={() => setSaved(toggleBookmark({ type, id, title, to }))}
      aria-pressed={saved}
      aria-label={saved ? `Remove bookmark: ${title}` : `Bookmark ${title}`}
      className={`flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1.5 rounded border transition ${
        saved
          ? 'border-neon-yellow/60 text-neon-yellow bg-neon-yellow/10'
          : 'border-edge text-slate-400 hover:border-slate-500 hover:text-slate-200'
      }`}
    >
      <Star size={12} fill={saved ? 'currentColor' : 'none'} />
      {saved ? 'Saved' : 'Save'}
    </button>
  );
}
