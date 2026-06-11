// Per-route SEO: title, meta description, canonical, OG tags, optional JSON-LD.
import { useEffect } from 'react';
import { getMeta } from './db';

// Production domain: set VITE_SITE_URL at build time; falls back to meta.json's baseUrl.
export const siteUrl = () => import.meta.env.VITE_SITE_URL || getMeta().baseUrl;

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!content) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function pageTitle(title) {
  const site = getMeta();
  return title ? `${title} — ${site.siteName}` : `${site.siteName} — ${site.tagline}`;
}

export function useSEO({ title, description, path = '/', jsonLd = null }) {
  useEffect(() => {
    const site = getMeta();
    const full = pageTitle(title);
    document.title = full;
    setMeta('name', 'description', description || site.tagline);
    setMeta('property', 'og:title', full);
    setMeta('property', 'og:description', description || site.tagline);
    setMeta('property', 'og:url', siteUrl() + path);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', siteUrl() + path);

    let ld = document.getElementById('rt-jsonld');
    if (jsonLd) {
      if (!ld) {
        ld = document.createElement('script');
        ld.type = 'application/ld+json';
        ld.id = 'rt-jsonld';
        document.head.appendChild(ld);
      }
      ld.textContent = JSON.stringify(jsonLd);
    } else {
      ld?.remove();
    }
  }, [title, description, path, jsonLd]);
}

export function articleLd({ title, description, path, dateModified }) {
  const site = getMeta();
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: siteUrl() + path,
    dateModified,
    publisher: { '@type': 'Organization', name: site.siteName },
  };
}
