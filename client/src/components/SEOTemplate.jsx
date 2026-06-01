import { Helmet } from "react-helmet-async";

/**
 * SEOTemplate - Reusable component for managing page-level SEO metadata
 *
 * This component provides a clean, consistent interface for setting meta tags,
 * title, description, and Open Graph tags across your application.
 *
 * @param {Object} props - Configuration object
 * @param {string} props.title - Page title
 * @param {string} props.description - Meta description
 * @param {string} [props.keywords] - Meta keywords
 * @param {string} [props.author] - Author meta tag
 * @param {string} [props.ogTitle] - Open Graph title
 * @param {string} [props.ogDescription] - Open Graph description
 * @param {string} [props.ogImage] - Open Graph image URL
 * @param {string} [props.ogUrl] - Open Graph URL
 * @param {string} [props.twitterCard] - Twitter card type (summary, summary_large_image, etc.)
 * @param {string} [props.twitterHandle] - Twitter account handle
 * @param {string} [props.canonical] - Canonical URL
 * @param {string} [props.language] - Language code (default: en)
 * @param {Array} [props.children] - Additional meta tags or components
 *
 * @example
 * import SEOTemplate from '@components/SEOTemplate'
 *
 * function ProductPage() {
 *   return (
 *     <SEOTemplate
 *       title="Premium Product - My Store"
 *       description="Check out our amazing products"
 *       keywords="products, shopping, store"
 *       ogImage="https://example.com/product.jpg"
 *       ogUrl="https://example.com/products"
 *       twitterHandle="@mystore"
 *     />
 *   )
 * }
 */
export default function SEOTemplate({
  title = "My App",
  description = "Welcome to My App",
  keywords = "",
  author = "",
  ogTitle = "",
  ogDescription = "",
  ogImage = "",
  ogUrl = "",
  twitterCard = "summary",
  twitterHandle = "",
  canonical = "",
  language = "en",
  children = null,
}) {
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang={language} />
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {author && <meta name="author" content={author} />}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="UTF-8" />

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph Meta Tags */}
      {ogTitle && <meta property="og:title" content={ogTitle} />}
      {ogDescription && (
        <meta property="og:description" content={ogDescription} />
      )}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      <meta property="og:type" content="website" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      {twitterHandle && <meta name="twitter:creator" content={twitterHandle} />}
      {ogTitle && <meta name="twitter:title" content={ogTitle} />}
      {ogDescription && (
        <meta name="twitter:description" content={ogDescription} />
      )}
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Favicon and App Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/logo192.png" />

      {/* Additional custom meta tags or children */}
      {children}
    </Helmet>
  );
}
