/**
 * useSEO — Centralized document.head management (per-page title, meta
 * description, canonical URL, Open Graph tags, and optional JSON-LD
 * structured data). No react-helmet-async — hand-built per instruction
 * to minimize external packages.
 *
 * Called once per page component:
 *   useSEO({
 *     title: 'Fullstack Web Development — Nextserve',
 *     description: '...',
 *     jsonLd: { '@type': 'Course', name: '...', ... },
 *   });
 *
 * Restores the previous title/description on unmount so that, e.g.,
 * a modal or nested route transition doesn't leave stale head tags
 * behind if the effect ever races (defensive — normally each page
 * fully replaces the previous page's tags via the router transition).
 */

import { useEffect } from 'react';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Nextserve';
const DEFAULT_OG_IMAGE = '/nsitm-og-image.png';

function upsertMetaTag(attr, key, content) {
  if (!content) return;
  let tag = document.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function upsertLinkTag(rel, href) {
  if (!href) return;
  let tag = document.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
}

function upsertJsonLd(data) {
  let script = document.getElementById('nsitm-jsonld');
  if (!data) {
    script?.remove();
    return;
  }
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'nsitm-jsonld';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify({ '@context': 'https://schema.org', ...data });
}

export function useSEO({ title, description, canonical, ogImage, jsonLd } = {}) {
  useEffect(() => {
    const previousTitle = document.title;

    if (title) {
      document.title = `${title} | ${APP_NAME}`;
    }
    upsertMetaTag('name', 'description', description);
    upsertMetaTag('property', 'og:title', title);
    upsertMetaTag('property', 'og:description', description);
    upsertMetaTag('property', 'og:image', ogImage || DEFAULT_OG_IMAGE);
    upsertMetaTag('property', 'og:type', 'website');
    upsertLinkTag('canonical', canonical || window.location.href);
    upsertJsonLd(jsonLd);

    return () => {
      document.title = previousTitle;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, canonical, ogImage, JSON.stringify(jsonLd)]);
}

export default useSEO;