import { useEffect } from "react";
import { useLocation } from "react-router";
import { useSEO } from "./SEOProvider";

/**
 * useHeadSEO — Page-Level SEO Hook (main-seo system)
 * ====================================================
 * Call this at the top of any page component to set that page's SEO metadata.
 * It merges your config with sensible defaults and updates the SEOProvider,
 * which in turn updates the <head> tags reactively.
 *
 * This hook is the primary way to use the main-seo system.
 * For the simpler alternative (no provider needed), see simple-seo/useSEO.
 *
 * -----------------------------------------------------------------------
 * USAGE — call at the top of any page component:
 *
 *   import { useHeadSEO } from "../../hooks/main-seo";
 *   import { SEO_CONFIG } from "../../hooks/main-seo";
 *
 *   // Option 1 — use a preset from seo-config.js (recommended)
 *   export default function AboutPage() {
 *     useHeadSEO(SEO_CONFIG.about);
 *     return <h1>About Us</h1>;
 *   }
 *
 *   // Option 2 — inline config
 *   export default function PrivacyPage() {
 *     useHeadSEO({
 *       title: "Privacy Policy",
 *       description: "Read our privacy policy.",
 *     });
 *     return <h1>Privacy Policy</h1>;
 *   }
 *
 *   // Option 3 — dynamic config (e.g. product page with API data)
 *   export default function ProductPage({ product }) {
 *     useHeadSEO(getSEOConfig("product", { name: product.name, price: product.price }));
 *     return <h1>{product.name}</h1>;
 *   }
 * -----------------------------------------------------------------------
 *
 * HOW TITLE FORMATTING WORKS:
 *   title: "About Us"  →  browser tab shows: "About Us — A Prime Mart"
 *   title: undefined   →  browser tab shows: "A Prime Mart"
 *
 * @param {object} seoConfig
 * @param {string}  [seoConfig.title]       - Page-specific title (suffix added automatically)
 * @param {string}  [seoConfig.description] - Page meta description
 * @param {string}  [seoConfig.keywords]    - Comma-separated keywords
 * @param {string}  [seoConfig.image]       - Absolute URL to OG/Twitter preview image
 * @param {string}  [seoConfig.author]      - Author name (defaults to "A Prime Mart")
 * @param {string}  [seoConfig.type]        - OG type, e.g. "website" or "product"
 */
export function useHeadSEO(seoConfig) {
  const { updateSEO } = useSEO();
  const location = useLocation();

  /**
   * Stringify the config so we can use it as a useEffect dependency safely.
   * Passing the raw object would cause infinite re-renders since a new object
   * is created on every render (even if the values are identical).
   */
  const configString = JSON.stringify(seoConfig);

  /**
   * Build the canonical URL from the current route.
   * This is regenerated on every navigation automatically.
   */
  const currentUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${location.pathname}`
      : "";

  useEffect(() => {
    const config = JSON.parse(configString) || {};

    updateSEO({
      title: config.title ? `${config.title} — A Prime Mart` : "A Prime Mart",
      description: config.description || "Your premier e-commerce platform",
      image: config.image || "",
      keywords: config.keywords || "e-commerce, shop, buy, sell",
      author: config.author || "A Prime Mart",
      type: config.type || "website",
      url: currentUrl,
    });
  }, [configString, currentUrl, updateSEO]);
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * useStructuredData — JSON-LD Structured Data Injection
 * ======================================================
 * Injects a JSON-LD <script> tag into <head> for rich search result snippets.
 * The script is added when the component mounts and removed when it unmounts,
 * so it only ever applies to the current page.
 *
 * Use with the STRUCTURED_DATA factories from seo-config.js:
 *
 *   import { useStructuredData, STRUCTURED_DATA } from "../../hooks/main-seo";
 *
 *   export default function ProductPage({ product }) {
 *     useStructuredData(
 *       STRUCTURED_DATA.product({
 *         name: product.name,
 *         price: product.price,
 *         image: product.imageUrl,
 *         inStock: true,
 *       })
 *     );
 *   }
 *
 * You can call useStructuredData multiple times on the same page
 * (e.g. once for Product and once for Breadcrumb):
 *
 *   useStructuredData(STRUCTURED_DATA.breadcrumb([...]));
 *   useStructuredData(STRUCTURED_DATA.product({ ... }));
 *
 * @param {object} data - A plain JSON-LD schema object (use STRUCTURED_DATA factories)
 */
export function useStructuredData(data) {
  /**
   * Stringify for stable dependency comparison — same reason as useHeadSEO.
   */
  const dataString = JSON.stringify(data);

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.innerHTML = dataString;
    document.head.appendChild(script);

    // Cleanup: remove the script when the component unmounts (i.e. when
    // the user navigates away from this page). This prevents stale structured
    // data from leaking into unrelated pages.
    return () => {
      document.head.removeChild(script);
    };
  }, [dataString]);
}

export default useHeadSEO;
