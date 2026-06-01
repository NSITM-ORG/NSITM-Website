import SEOTemplate from './SEOTemplate'

/**
 * PageWrapper - Example component for wrapping pages with SEO configuration
 *
 * Use this as a pattern for creating SEO-managed pages in a larger app.
 * This allows centralized SEO management per route/page.
 *
 * @param {Object} props - Page configuration
 * @param {React.ReactNode} props.children - Page content
 * @param {Object} props.seoConfig - SEO metadata configuration
 *
 * @example
 * function HomePage() {
 *   return (
 *     <PageWrapper
 *       seoConfig={{
 *         title: 'Home - My App',
 *         description: 'Welcome to my app',
 *         canonical: 'https://myapp.com',
 *       }}
 *     >
 *       <h1>Welcome</h1>
 *     </PageWrapper>
 *   )
 * }
 */
export default function PageWrapper({
  children,
  seoConfig = {},
}) {
  const defaultConfig = {
    title: 'My App',
    description: 'A modern React 19 app built with Vite',
    ...seoConfig,
  }

  return (
    <>
      <SEOTemplate {...defaultConfig} />
      {children}
    </>
  )
}
