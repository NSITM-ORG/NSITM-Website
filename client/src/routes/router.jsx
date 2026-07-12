/**
 * Router — builds the React Router v7 data router from resolvedRoutes.
 *
 * Groups routes by `layout` so each layout wraps its children exactly
 * once (one <SiteLayout> parent route with many child routes, etc.),
 * matching React Router's nested-route model rather than re-wrapping
 * every single page individually.
 *
 * Each leaf route's `handle` carries { title, footer } so
 * SiteLayout/PanelLayout can read it via useMatches() without prop
 * drilling (see both layout files in this same batch).
 *
 * ProtectedRoute wraps every element using the route's own `access`
 * field — this is the ONLY place role-gating logic is applied.
 */

import { createBrowserRouter } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { SiteLayout } from '../layouts/SiteLayout.jsx';
import { PanelLayout } from '../layouts/PanelLayout.jsx';
import { SinglePageLayout } from '../layouts/SinglePageLayout.jsx';
import { ProtectedRoute } from '../components/ui/ProtectedRoute.jsx';
import { RouteFallback } from '../components/ui/Preloader.jsx';
import { resolvedRoutes } from './routeRegistry.js';

const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));


function buildChildRoute(route) {
  const { Component, ...routeMeta } = route;
  return {
    path: route.path,
    handle: { title: route.meta?.title, footer: route.footer },
    element: (
      <ProtectedRoute access={route.access}>
        <Suspense fallback={<RouteFallback />}>
          <Component />
        </Suspense>
      </ProtectedRoute>
    ),
  };
}

const siteChildren = resolvedRoutes.filter((r) => r.layout === 'SiteLayout').map(buildChildRoute);
const panelChildren = resolvedRoutes.filter((r) => r.layout === 'PanelLayout').map(buildChildRoute);
const singlePageChildren = resolvedRoutes.filter((r) => r.layout === 'SinglePageLayout').map(buildChildRoute);
const standaloneRoutes = resolvedRoutes.filter((r) => r.layout === 'none').map((route) => {
  const { Component } = route;
  return {
    path: route.path,
    handle: { title: route.meta?.title },
    element: (
      <Suspense fallback={<RouteFallback />}>
        <Component />
      </Suspense>
    ),
  };
});

export const router = createBrowserRouter([
  { element: <SiteLayout />, children: siteChildren },
  { element: <PanelLayout />, children: panelChildren },
  { element: <SinglePageLayout />, children: singlePageChildren },
  ...standaloneRoutes,
   {
    path: '*',
    element: (
      <Suspense fallback={<RouteFallback />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]);

export default router;