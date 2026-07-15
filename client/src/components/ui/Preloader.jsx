/**
 * Preloader — full-screen branded loader (build instruction #17).
 * Two usages:
 *   1. <AppPreloader/> — shown once at true app boot, gated by
 *      useAuth().bootstrapped (Batch F5 App.jsx), so the very first
 *      paint isn't a flash of an unauthenticated shell before the
 *      session check resolves.
 *   2. <RouteFallback/> — passed as the Suspense fallback for lazy-
 *      loaded panel route chunks (Batch F5 router), shown briefly on
 *      route-level code-split boundaries.
 */

export function AppPreloader() {
  return (
    <div className="fixed inset-0 z-200 flex flex-col items-center justify-center gap-4 bg-background">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-surface border-t-primary" />
      <p className="font-heading text-lg font-semibold text-primary">Nextserve</p>
    </div>
  );
}

export function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-surface border-t-primary" />
    </div>
  );
}

export default AppPreloader;