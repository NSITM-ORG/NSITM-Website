import useSEO from "../../hooks/simple-seo/useSEO";

/**
 * SeoDemo — Demonstrates the simple-seo hook (useSEO)
 * =====================================================
 * This page uses the lightweight simple-seo hook, NOT the main-seo system.
 * It shows how React 19 handles SEO natively without any provider or context.
 *
 * Notice how the hook returns JSX that you spread into your return statement.
 * React 19 picks up those <title> and <meta> elements and hoists them to <head>.
 */
export default function SeoDemo() {
  const seo = useSEO({
    title: "React 19 Custom SEO Hook Demonstration",
    description:
      "Learn how React 19 natively hoists SEO titles and meta data attributes.",
    keywords: "react 19, seo, meta tags, head hoisting",
    canonicalUrl: typeof window !== "undefined" ? window.location.href : "",
  });

  return (
    <div style={{ padding: "24px", textAlign: "left" }}>
      {/* Render the SEO elements — React 19 hoists them to <head> automatically */}
      {seo}

      <h2>1. Custom SEO Hook Usage (simple-seo)</h2>
      <p>
        This page demonstrates how React 19 handles search metadata without
        third-party tools.
      </p>

      <div style={{ marginTop: "20px" }}>
        <h3>How it works:</h3>
        <code>
          {`const seo = useSEO({ title: "My Page", description: "..." });`}
        </code>
        <p style={{ marginTop: "10px" }}>
          Inspect your browser's <strong>&lt;head&gt;</strong> right now. You
          will see the tags have been injected and will be cleaned up
          automatically on navigation.
        </p>
      </div>
    </div>
  );
}
