/**
 * SEO Configuration & Patterns for Scalable Applications
 *
 * This file demonstrates various SEO patterns for different scenarios
 * in large-scale React 19 + Vite applications using react-helmet-async
 */

// Pattern 1: Basic Site Defaults
export const siteDefaults = {
  siteName: "My App",
  siteUrl: "https://myapp.com",
  twitterHandle: "@myapp",
  socialImage: "/og-image.jpg",
  socialImageAlt: "My App - Description",
};

// Pattern 2: Route-specific SEO Configuration
export const routeSEO = {
  home: {
    title: "Home - My App",
    description: "Welcome to My App - Transform your workflow",
    keywords: "app, solution, productivity",
    canonical: `${siteDefaults.siteUrl}/`,
  },
  about: {
    title: "About Us - My App",
    description: "Learn about Our App and our mission",
    keywords: "about, team, mission, company",
    canonical: `${siteDefaults.siteUrl}/about`,
  },
  features: {
    title: "Features - My App",
    description: "Discover powerful features to boost productivity",
    keywords: "features, capabilities, tools",
    canonical: `${siteDefaults.siteUrl}/features`,
  },
  pricing: {
    title: "Pricing Plans - My App",
    description: "Simple, transparent pricing for every need",
    keywords: "pricing, plans, subscription, cost",
    canonical: `${siteDefaults.siteUrl}/pricing`,
  },
  contact: {
    title: "Contact Us - My App",
    description: "Get in touch with our support team",
    keywords: "contact, support, help, customer service",
    canonical: `${siteDefaults.siteUrl}/contact`,
  },
};

// Pattern 3: Dynamic Page SEO (for pages with user/product data)
export const getDynamicSEO = (type, data) => {
  switch (type) {
    case "product":
      return {
        title: `${data.name} - My App`,
        description:
          data.shortDescription || data.description?.substring(0, 160),
        keywords: [data.category, ...data.tags].join(", "),
        ogTitle: data.name,
        ogDescription:
          data.shortDescription || data.description?.substring(0, 160),
        ogImage: data.image || siteDefaults.socialImage,
        ogUrl: `${siteDefaults.siteUrl}/products/${data.id}`,
        canonical: `${siteDefaults.siteUrl}/products/${data.id}`,
        twitterCard: "summary_large_image",
      };

    case "blog-post":
      return {
        title: `${data.title} - Blog | My App`,
        description: data.excerpt,
        keywords: data.tags?.join(", "),
        ogTitle: data.title,
        ogDescription: data.excerpt,
        ogImage: data.coverImage,
        ogUrl: `${siteDefaults.siteUrl}/blog/${data.slug}`,
        canonical: `${siteDefaults.siteUrl}/blog/${data.slug}`,
        twitterCard: "summary_large_image",
      };

    case "user-profile":
      return {
        title: `${data.name} - My App`,
        description: data.bio || `${data.name}'s profile on My App`,
        ogTitle: data.name,
        ogDescription: data.bio,
        ogImage: data.avatar,
        ogUrl: `${siteDefaults.siteUrl}/profile/${data.username}`,
        canonical: `${siteDefaults.siteUrl}/profile/${data.username}`,
      };

    default:
      return routeSEO.home;
  }
};

// Pattern 4: Schema.org Structured Data Generators
export const generateStructuredData = (type, data) => {
  switch (type) {
    case "organization":
      return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: siteDefaults.siteName,
        url: siteDefaults.siteUrl,
        logo: `${siteDefaults.siteUrl}/logo.png`,
        description: "My App - Transform your workflow",
        sameAs: [
          "https://twitter.com/myapp",
          "https://facebook.com/myapp",
          "https://linkedin.com/company/myapp",
        ],
      };

    case "product":
      return {
        "@context": "https://schema.org",
        "@type": "Product",
        name: data.name,
        description: data.description,
        image: data.image,
        brand: {
          "@type": "Brand",
          name: siteDefaults.siteName,
        },
        offers: {
          "@type": "Offer",
          url: `${siteDefaults.siteUrl}/products/${data.id}`,
          priceCurrency: "USD",
          price: data.price,
          availability: data.inStock ? "InStock" : "OutOfStock",
        },
        aggregateRating: data.rating && {
          "@type": "AggregateRating",
          ratingValue: data.rating.value,
          reviewCount: data.rating.count,
        },
      };

    case "blog-post":
      return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: data.title,
        description: data.excerpt,
        image: data.coverImage,
        datePublished: data.publishedDate,
        dateModified: data.updatedDate,
        author: {
          "@type": "Person",
          name: data.authorName,
        },
        publisher: {
          "@type": "Organization",
          name: siteDefaults.siteName,
          logo: {
            "@type": "ImageObject",
            url: `${siteDefaults.siteUrl}/logo.png`,
          },
        },
      };

    case "faq":
      return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: data.items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      };

    case "event":
      return {
        "@context": "https://schema.org",
        "@type": "Event",
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        eventAttendanceMode: "OnlineEventAttendanceMode",
        eventStatus: "EventScheduled",
        location: {
          "@type": "VirtualLocation",
          url: data.url,
        },
        organizer: {
          "@type": "Organization",
          name: siteDefaults.siteName,
          url: siteDefaults.siteUrl,
        },
      };

    default:
      return null;
  }
};

// Pattern 5: Social Media Meta Tags Helper
export const getSocialMeta = (data) => {
  return {
    // Open Graph (Facebook, LinkedIn, etc.)
    og: {
      title: data.ogTitle || data.title,
      description: data.ogDescription || data.description,
      image: data.ogImage,
      url: data.ogUrl,
      type: data.ogType || "website",
    },
    // Twitter Card
    twitter: {
      card: data.twitterCard || "summary_large_image",
      handle: siteDefaults.twitterHandle,
      title: data.title,
      description: data.description,
      image: data.ogImage,
    },
  };
};

// Pattern 6: Breadcrumb Schema for Navigation
export const generateBreadcrumbs = (path) => {
  const segments = path.split("/").filter(Boolean);
  const breadcrumbs = [];
  let url = "";

  breadcrumbs.push({
    "@type": "ListItem",
    position: 1,
    name: "Home",
    item: siteDefaults.siteUrl,
  });

  segments.forEach((segment, index) => {
    url += `/${segment}`;
    breadcrumbs.push({
      "@type": "ListItem",
      position: index + 2,
      name: segment.charAt(0).toUpperCase() + segment.slice(1),
      item: `${siteDefaults.siteUrl}${url}`,
    });
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs,
  };
};

// Pattern 7: Robots.txt Meta Tags
export const getRobotsMeta = (page) => {
  const defaultRobots = "index, follow";

  const pageRobotsConfig = {
    "/admin": "noindex, nofollow",
    "/private": "noindex, nofollow",
    "/login": "noindex, follow",
    "/search": "noindex, follow",
  };

  return pageRobotsConfig[page] || defaultRobots;
};

// Pattern 8: Canonical URL Helper
export const getCanonicalUrl = (path, params = {}) => {
  let url = `${siteDefaults.siteUrl}${path}`;

  if (Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  }

  return url;
};

// Pattern 9: Alternate Language Links (for i18n)
export const getAlternateLanguages = (path, languages = ["en", "es", "fr"]) => {
  return languages.map((lang) => ({
    rel: "alternate",
    hrefLang: lang,
    href: `${siteDefaults.siteUrl}/${lang}${path}`,
  }));
};

// Export all patterns as a single object for convenience
export const SEOPatterns = {
  siteDefaults,
  routeSEO,
  getDynamicSEO,
  generateStructuredData,
  getSocialMeta,
  generateBreadcrumbs,
  getRobotsMeta,
  getCanonicalUrl,
  getAlternateLanguages,
};

export default SEOPatterns;
