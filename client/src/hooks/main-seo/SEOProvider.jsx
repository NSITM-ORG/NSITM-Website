import React from "react";

/**
 * SEOProvider — Global SEO Context (main-seo system)
 * ====================================================
 * Wrap your entire application with this once in main.jsx.
 * It provides a React context that any page can update via useHeadSEO.
 *
 * This component holds the current page's SEO state and renders the
 * matching meta tags directly. React 19 hoists them to <head> natively —
 * no react-helmet-async or react-helmet needed.
 *
 * -----------------------------------------------------------------------
 * SETUP — add once in main.jsx:
 *
 *   import { SEOProvider } from "./hooks/main-seo";
 *
 *   createRoot(document.getElementById("root")).render(
 *     <SEOProvider>
 *       <App />
 *     </SEOProvider>
 *   );
 * -----------------------------------------------------------------------
 *
 * DEFAULTS — these values are used until a page calls useHeadSEO to override them.
 * They act as a fallback for any route that doesn't set its own SEO.
 */

/** @internal — used by useHeadSEO to access updateSEO */
// eslint-disable-next-line react-refresh/only-export-components
export const SEOContext = React.createContext();

/**
 * useSEO — access the raw SEO context (advanced use only)
 * ---------------------------------------------------------
 * Most pages should use useHeadSEO instead — it handles config
 * merging, title formatting, and URL detection automatically.
 *
 * Use useSEO directly only if you need to read seoData or call
 * updateSEO with a manually constructed config object.
 *
 * @returns {{ seoData: object, updateSEO: function }}
 * @throws {Error} if called outside of <SEOProvider>
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useSEO() {
  const context = React.useContext(SEOContext);
  if (!context) {
    throw new Error(
      "useSEO must be called inside <SEOProvider>. " +
        "Make sure SEOProvider wraps your app in main.jsx.",
    );
  }
  return context;
}

/**
 * SEOProvider component
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Your application tree
 */
export function SEOProvider({ children }) {
  const [seoData, setSeoData] = React.useState({
    title: "A Prime Mart",
    description: "Your premier e-commerce platform",
    image: "",
    url: "",
    type: "website",
    author: "A Prime Mart",
    keywords: "e-commerce, shop, buy, sell",
  });

  /**
   * updateSEO — merge new values into the current SEO state.
   * Called internally by useHeadSEO on every route change.
   * Wrap in useCallback so its reference stays stable and
   * doesn't cause pages to re-run their useEffect unnecessarily.
   */
  const updateSEO = React.useCallback((newData) => {
    setSeoData((prev) => ({ ...prev, ...newData }));
  }, []);

  return (
    <SEOContext.Provider value={{ seoData, updateSEO }}>
      {/*
       * React 19 native hoisting:
       * These tags are placed inside the JSX tree here but React 19
       * automatically moves them into the document <head> at render time.
       * They update reactively whenever seoData changes (i.e. on route change).
       */}

      {/* ── Core ─────────────────────────────────────────────────────── */}
      <title>{seoData.title}</title>
      <meta name="description" content={seoData.description} />
      <meta name="keywords" content={seoData.keywords} />
      <meta name="author" content={seoData.author} />

      {/* ── Open Graph (Facebook, LinkedIn, WhatsApp previews) ────────── */}
      <meta property="og:type" content={seoData.type} />
      <meta property="og:title" content={seoData.title} />
      <meta property="og:description" content={seoData.description} />
      {seoData.image && <meta property="og:image" content={seoData.image} />}
      {seoData.url && <meta property="og:url" content={seoData.url} />}

      {/* ── Twitter Cards ─────────────────────────────────────────────── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoData.title} />
      <meta name="twitter:description" content={seoData.description} />
      {seoData.image && <meta name="twitter:image" content={seoData.image} />}

      {/* ── Canonical URL (prevents duplicate content penalties) ──────── */}
      {seoData.url && <link rel="canonical" href={seoData.url} />}

      {children}
    </SEOContext.Provider>
  );
}
