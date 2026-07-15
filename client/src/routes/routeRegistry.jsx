/**
 * Route Registry — merges every route-array file into one flat list,
 * and resolves each route's `page` name to an actual lazy-loaded React
 * component via Vite's import.meta.glob().
 *
 * WHY import.meta.glob() INSTEAD OF A HAND-WRITTEN IMPORT MAP:
 *   Batches F6–F10 add page files incrementally. Rather than editing
 *   this registry every time a new page lands (and risking a stale/
 *   missing entry), glob() scans src/pages/**\/*.jsx at build time and
 *   builds the map automatically. A route whose page file doesn't exist
 *   YET simply falls through to <PageNotBuiltYet/> — the app never
 *   crashes, and once the real file is added in a later batch, this
 *   registry picks it up with ZERO changes here.
 *
 * `{ eager: false }` (the default) keeps each page as a separate lazy
 * chunk — route-level code splitting for free, matching the
 * Preloader's RouteFallback Suspense boundary in router.jsx.
 */

import { lazy } from 'react';
import { siteRoutes } from './siteRoutes';
import { enrollmentRoutes } from './enrollmentRoutes';
import { authRoutes } from './authRoutes';
import { adminRoutes } from './adminRoutes';
import { superAdminRoutes } from './superAdminRoutes';

export const allRoutes = [
  ...siteRoutes,
  ...enrollmentRoutes,
  ...authRoutes,
  ...adminRoutes,
  ...superAdminRoutes,
];

// Vite-only syntax — resolves at build time to a static map of
// { '/src/pages/site/HomePage.jsx': () => import('...'), ... }
const pageModules = import.meta.glob('/src/pages/**/*.jsx');

/**
 * PageNotBuiltYet — graceful fallback for any route whose page file
 * doesn't exist in the current batch state. Purely a development-time
 * safety net; every route will resolve to a real page by the end of F10.
 */
// eslint-disable-next-line react-refresh/only-export-components
function PageNotBuiltYet({ pageName, title }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-center">
      <h2 className="font-heading text-xl font-semibold text-text-primary">{title || pageName}</h2>
      <p className="text-sm text-text-secondary">This page is under construction. Check back soon.</p>
    </div>
  );
}

/**
 * Resolves a `page` string (e.g. 'HomePage') to a lazy React component
 * by matching it against the end of each globbed file path.
 */
function resolvePageComponent(pageName, title) {
  const match = Object.keys(pageModules).find((path) => path.endsWith(`/${pageName}.jsx`));
  if (!match) {
    return () => <PageNotBuiltYet pageName={pageName} title={title} />;
  }
  return lazy(pageModules[match]);
}

/** Attaches a resolved `Component` to every route entry. */
export const resolvedRoutes = allRoutes.map((route) => ({
  ...route,
  Component: resolvePageComponent(route.page, route.meta?.title),
}));

export default resolvedRoutes;