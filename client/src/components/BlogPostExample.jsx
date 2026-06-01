/**
 * Example: Blog Post Page with Full SEO Setup
 * Demonstrates blog-specific SEO with article schema and metadata
 */

import { Helmet } from "react-helmet-async";
import SEOTemplate from "./SEOTemplate";
import {
  getDynamicSEO,
  generateStructuredData,
  generateBreadcrumbs,
  getAlternateLanguages,
} from "@lib/seoPatterns";

// Example blog post data
const mockBlogPost = {
  title: "How to Build Scalable React Apps with Vite",
  slug: "build-scalable-react-apps-vite",
  excerpt:
    "Learn best practices for building scalable React applications with Vite and modern tooling.",
  description:
    "In this comprehensive guide, we cover everything you need to know about building scalable React applications with Vite, including optimization techniques, code splitting, and SEO best practices.",
  content: "Full article content here...",
  coverImage: "/blog/react-vite-guide.jpg",
  authorName: "Jane Developer",
  publishedDate: "2024-01-15T10:00:00Z",
  updatedDate: "2024-01-20T14:30:00Z",
  tags: ["react", "vite", "performance", "tutorial"],
  readingTime: 12,
};

export default function BlogPostPage() {
  const blogSEO = getDynamicSEO("blog-post", mockBlogPost);
  const schemaData = generateStructuredData("blog-post", mockBlogPost);
  const breadcrumbs = generateBreadcrumbs(`/blog/${mockBlogPost.slug}`);
  const alternateLanguages = getAlternateLanguages(
    `/blog/${mockBlogPost.slug}`,
  );

  return (
    <>
      {/* Primary SEO Template */}
      <SEOTemplate {...blogSEO} />

      {/* Additional Helmet tags for blog-specific SEO */}
      <Helmet>
        {/* Schema.org Structured Data - Blog Post */}
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>

        {/* Schema.org Structured Data - Breadcrumbs */}
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbs)}
        </script>

        {/* Article-specific meta tags */}
        <meta
          property="article:published_time"
          content={mockBlogPost.publishedDate}
        />
        <meta
          property="article:modified_time"
          content={mockBlogPost.updatedDate}
        />
        <meta property="article:author" content={mockBlogPost.authorName} />
        {mockBlogPost.tags.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}

        {/* Alternate language links */}
        {alternateLanguages.map((alt) => (
          <link
            key={alt.hrefLang}
            rel={alt.rel}
            hrefLang={alt.hrefLang}
            href={alt.href}
          />
        ))}

        {/* Reading time estimate */}
        <meta
          name="reading-time"
          content={`${mockBlogPost.readingTime} min read`}
        />
      </Helmet>

      {/* Page Content */}
      <article className="blog-post">
        <header className="blog-header">
          <h1>{mockBlogPost.title}</h1>
          <p className="meta">
            By {mockBlogPost.authorName} | Published{" "}
            {new Date(mockBlogPost.publishedDate).toLocaleDateString()}
          </p>
          <p className="reading-time">{mockBlogPost.readingTime} min read</p>
        </header>

        <img
          src={mockBlogPost.coverImage}
          alt={mockBlogPost.title}
          className="cover-image"
        />

        <div className="blog-content">
          <p>{mockBlogPost.content}</p>
        </div>

        <footer className="blog-footer">
          <div className="tags">
            {mockBlogPost.tags.map((tag) => (
              <a key={tag} href={`/blog/tag/${tag}`} className="tag">
                #{tag}
              </a>
            ))}
          </div>
        </footer>
      </article>
    </>
  );
}
