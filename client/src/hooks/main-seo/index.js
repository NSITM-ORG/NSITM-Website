/**
 * main-seo barrel export
 * =======================
 * Import anything from the main-seo system via this single entry point:
 *
 *   import { SEOProvider, useSEO, useHeadSEO, useStructuredData, SEO_CONFIG, getSEOConfig, STRUCTURED_DATA } from "../hooks/main-seo";
 *
 * WHAT EACH EXPORT DOES:
 *
 *   SEOProvider        — Wrap your app with this once in main.jsx
 *   useSEO             — Low-level context accessor (advanced use)
 *   useHeadSEO         — Set page SEO on any route (most common usage)
 *   useStructuredData  — Inject JSON-LD structured data on a page
 *   SEO_CONFIG         — Pre-built SEO configs for every route
 *   getSEOConfig       — Helper to resolve static or dynamic SEO configs
 *   STRUCTURED_DATA    — JSON-LD schema factories (Product, Breadcrumb, Organization)
 */
export { SEOProvider, useSEO } from "./SEOProvider";
export { useHeadSEO, useStructuredData } from "./useHeadSEO";
export { SEO_CONFIG, getSEOConfig, STRUCTURED_DATA } from "./seo-config";