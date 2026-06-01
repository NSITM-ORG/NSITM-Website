# My App - React 19 + Vite + SEO with Helmet

A modern, scalable React 19 application built with Vite and equipped with enterprise-grade SEO capabilities using React Helmet Async.

## ✨ Features

- **⚡ Vite:** Lightning-fast development server with HMR
- **⚛️ React 19:** Latest React features and optimizations
- **🔍 SEO-First:** Helmet integration for meta tag management
- **🎨 Tailwind CSS:** Utility-first CSS framework
- **📦 Code Splitting:** Optimized production builds
- **🎯 Path Aliases:** Clean import paths (@components, @hooks, etc.)
- **📱 Responsive:** Mobile-first design
- **🚀 Production Ready:** Optimized for large-scale applications

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ (18+ recommended)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will open at `http://localhost:5173` with HMR enabled.

## 📁 Project Structure

```
src/
├── components/
│   ├── SEOTemplate.jsx          # Reusable Helmet SEO wrapper
│   ├── PageWrapper.jsx          # Page-level SEO pattern
│   ├── ProductDetailExample.jsx # Product page SEO example
│   └── BlogPostExample.jsx      # Blog post SEO example
├── hooks/                       # Custom React hooks
├── lib/
│   └── seoPatterns.js          # SEO utilities & patterns
├── routes/                      # Route components
├── App.jsx                      # Main app component
├── main.jsx                     # Vite entry point
└── index.css                    # Global styles
```

## 🔍 SEO Features

### Basic Usage

```jsx
import SEOTemplate from "@components/SEOTemplate";

export default function HomePage() {
  return (
    <>
      <SEOTemplate
        title="Home - My App"
        description="Welcome to my amazing app"
        ogImage="/og-image.jpg"
        canonical="https://myapp.com"
      />
      <h1>Welcome</h1>
    </>
  );
}
```

### Advanced Features

- **Dynamic Meta Tags:** Update SEO per page/component
- **Open Graph Support:** Social media sharing optimization
- **Twitter Cards:** Twitter-specific metadata
- **Structured Data:** Schema.org JSON-LD support
- **Breadcrumbs:** Navigation hierarchy schema
- **Alternate Languages:** i18n language links
- **Canonical URLs:** Prevent duplicate content

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for comprehensive documentation.

## 📚 SEO Patterns & Examples

The `src/lib/seoPatterns.js` file provides reusable patterns:

- Site defaults and configuration
- Route-specific SEO metadata
- Dynamic page SEO generation
- Structured data generators (Product, Blog, Event, etc.)
- Social media meta tags
- Breadcrumb schema
- Robots meta tags
- Canonical URL helpers
- Alternate language links

Example components demonstrate:

- Product detail pages with rich snippets
- Blog posts with article schema
- Full integration with React components

## 🎯 Available Scripts

| Script            | Purpose                            |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start dev server at localhost:5173 |
| `npm run build`   | Create optimized production build  |
| `npm run preview` | Preview production build locally   |

## 🛠️ Configuration Files

- **vite.config.js** - Vite configuration with React plugin
- **tailwind.config.js** - Tailwind CSS configuration
- **postcss.config.js** - PostCSS with Tailwind & autoprefixer
- **package.json** - Dependencies and scripts

## 🌐 Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=https://api.myapp.com
VITE_ANALYTICS_ID=your-analytics-id
```

Access in code:

```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

## 🚀 Scaling for Large Applications

### Organize Routes with SEO

```jsx
// src/routes/Products.jsx
import PageWrapper from "@components/PageWrapper";
import { routeSEO } from "@lib/seoPatterns";

export default function Products() {
  return (
    <PageWrapper seoConfig={routeSEO.products}>
      {/* Products list */}
    </PageWrapper>
  );
}
```

### Use SEO Patterns for Dynamic Content

```jsx
import { getDynamicSEO, generateStructuredData } from "@lib/seoPatterns";

function ProductPage({ product }) {
  const seo = getDynamicSEO("product", product);
  const schema = generateStructuredData("product", product);

  return (
    <>
      <SEOTemplate {...seo} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>
      {/* Content */}
    </>
  );
}
```

## 📖 Documentation

- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Complete migration guide with examples
- [Vite Documentation](https://vitejs.dev)
- [React 19 Documentation](https://react.dev)
- [React Helmet Async](https://github.com/steveruizok/react-helmet-async)
- [Tailwind CSS](https://tailwindcss.com)

## 🎯 SEO Checklist

- [ ] Configure site defaults in `src/lib/seoPatterns.js`
- [ ] Create SEO config for each main route
- [ ] Add structured data (Schema.org) for key pages
- [ ] Implement Open Graph tags
- [ ] Set up canonical URLs
- [ ] Configure robots meta tags
- [ ] Test with Google Search Console
- [ ] Validate with Lighthouse
- [ ] Set up analytics (GA4, etc.)

## 🔧 Performance Tips

1. **Code Splitting:** Vite handles automatically
2. **Image Optimization:** Use modern formats (WebP, AVIF)
3. **Lazy Loading:** Use React.lazy() for heavy components
4. **Caching:** Configure cache headers in deployment
5. **CDN:** Deploy dist folder to CDN

## 🐛 Troubleshooting

**HMR not working?**

- Check vite.config.js HMR settings
- Verify firewall allows websocket connections

**Styles not loading?**

- Ensure index.css is imported in main.jsx
- Check Tailwind content paths in tailwind.config.js

**Meta tags not updating?**

- Verify HelmetProvider wraps your app
- Check browser DevTools for rendered meta tags

## 📦 Dependencies

- **react** (^19.2.6) - UI library
- **react-dom** (^19.2.6) - DOM rendering
- **react-helmet-async** (^2.1.0) - SEO meta tags
- **vite** (^5.1.0) - Build tool
- **@vitejs/plugin-react** (^4.3.0) - React support
- **tailwindcss** (^3.4.19) - CSS framework
- **autoprefixer** (^10.5.0) - CSS vendor prefixes
- **postcss** (^8.5.15) - CSS processing

## 📄 License

MIT

## 🤝 Support

For issues or questions, please refer to:

- [Vite Issues](https://github.com/vitejs/vite/issues)
- [React Issues](https://github.com/facebook/react/issues)
- [Helmet Issues](https://github.com/steveruizok/react-helmet-async/issues)

---

**Built with ❤️ using React 19, Vite, and Helmet for SEO**
