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

import SiteLogo from "../assets/SiteLogo";


export function AppPreloader() {
  return (
    <div className="fixed inset-0 z-200 flex flex-col items-center justify-center gap-5 bg-background">
      {/* <img src="/nsitm-logo.svg" alt="" className="h-14 w-14 animate-pulse rounded-md" /> */}
      <SiteLogo />
      <div className="relative font-heading text-2xl font-bold text-primary">
        <span className="opacity-20">Nextserve</span>
        <span className="absolute inset-0 overflow-hidden text-primary" style={{ animation: 'preloaderReveal 1.6s ease-in-out infinite' }}>
          Nextserve
        </span>
      </div>
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