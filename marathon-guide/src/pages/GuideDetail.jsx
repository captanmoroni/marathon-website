import { useParams } from 'react-router-dom';
import { Panel, Breadcrumbs, SourceList, RelatedLinks, EditorialBadge, DraftBadge } from '../components/ui';
import { getRecord, resolveRef } from '../lib/db';
import BookmarkButton from '../components/BookmarkButton';
import { useSEO, articleLd } from '../lib/seo';
import NotFound from './NotFound';

export default function GuideDetail() {
  const { slug } = useParams();
  const guide = getRecord('guides', slug);
  useSEO({
    title: guide?.title,
    description: guide?.summary,
    path: `/guides/${slug}`,
    jsonLd: guide ? articleLd({ title: guide.title, description: guide.summary, path: `/guides/${slug}`, dateModified: guide.lastVerified }) : null,
  });
  if (!guide) return <NotFound />;

  return (
    <div className="max-w-3xl">
      <Breadcrumbs trail={[{ label: 'Guides', to: '/guides' }, { label: guide.title }]} />
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-mono uppercase tracking-widest text-neon-yellow">{guide.category}</span>
        {guide.editorial && <EditorialBadge />}
        {guide._draft && <DraftBadge />}
        <span className="ml-auto"><BookmarkButton type="guide" id={guide.id} title={guide.title} to={`/guides/${guide.slug}`} /></span>
      </div>
      <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-1">{guide.title}</h1>
      <p className="text-sm text-slate-400 mt-2">{guide.summary}</p>

      <Panel className="mt-5">
        <article className="p-5 space-y-4">
          {guide.body.map((para, i) => (
            <p key={i} className="text-sm leading-relaxed text-slate-300">{para}</p>
          ))}
          <RelatedLinks refs={guide.related} resolve={resolveRef} />
          <SourceList sources={guide.sources} lastVerified={guide.lastVerified} />
        </article>
      </Panel>
    </div>
  );
}
