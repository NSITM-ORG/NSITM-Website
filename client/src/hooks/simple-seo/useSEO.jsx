import { useEffect } from "react";

/**
 * useSEO — Simple SEO Hook (React 19 Native)
 * ============================================
 * A lightweight hook that injects SEO metadata directly into your component.
 * No context, no providers, no third-party libraries needed.
 *
 * React 19 automatically "hoists" <title> and <meta> tags to the document
 * <head> when they appear anywhere in the component tree — even inside a
 * regular function component. This hook takes advantage of that behaviour.
 *
 * ✅ USE THIS WHEN:
 *   - You want quick, self-contained SEO on a single page
 *   - You don't need Open Graph / Twitter card tags
 *   - You don't want to wrap your app in a provider
 *
 * ❌ USE main-seo INSTEAD WHEN:
 *   - You need Open Graph / Twitter cards (social sharing previews)
 *   - You need structured data (JSON-LD) for rich search snippets
 *   - You need a site-wide SEO default that pages can override
 *
 * -----------------------------------------------------------------------
 * USAGE — call inside any page component:
 *
 *   import useSEO from "../../hooks/simple-seo/useSEO";
 *
 *   export default function AboutPage() {
 *     const seo = useSEO({
 *       title: "About Us",
 *       description: "Learn about our company and mission.",
 *       keywords: "about, company, mission",
 *       canonicalUrl: window.location.href,
 *     });
 *
 *     return (
 *       <>
 *         {seo}
 *         <h1>About Us</h1>
 *       </>
 *     );
 *   }
 * -----------------------------------------------------------------------
 *
 * @param {object} params
 * @param {string} [params.title]        - Page title shown in the browser tab
 * @param {string} [params.description]  - Short summary shown in search results
 * @param {string} [params.keywords]     - Comma-separated keywords (minor SEO signal)
 * @param {string} [params.canonicalUrl] - The preferred URL for this page (avoids duplicate content)
 *
 * @returns {JSX.Element} — Render this somewhere in your component's return statement
 */
export default function useSEO({
  title = "A Prime Mart",
  description = "Your premier e-commerce platform",
  keywords = "e-commerce, shop, buy, sell",
  canonicalUrl = "",
}) {
  /**
   * React 19 hoists <title> to the document head automatically.
   * This useEffect is a belt-and-suspenders fallback for environments
   * or test runners where React 19's hoist behaviour is not active.
   * In production with React 19 it is effectively a no-op.
   */
  useEffect(() => {
    if (title && typeof document !== "undefined") {
      document.title = title;
    }
  }, [title]);

  /**
   * These JSX elements are returned and must be rendered in the component tree.
   * React 19 picks them up and moves them into <head> automatically.
   * Spread them into your return statement: `<>{seo}<main>...</main></>`
   */
  return (
    <>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {/* Open Graph — controls how this page appears when shared on social media */}
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
    </>
  );
}
