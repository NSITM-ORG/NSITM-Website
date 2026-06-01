/**
 * Example: Product Detail Page with Full SEO Setup
 * Demonstrates dynamic SEO, structured data, and schema.org integration
 */

import { Helmet } from "react-helmet-async";
import SEOTemplate from "./SEOTemplate";
import {
  getDynamicSEO,
  generateStructuredData,
  generateBreadcrumbs,
  getRobotsMeta,
} from "@lib/seoPatterns";

// Example product data (would come from API/props)
const mockProduct = {
  id: "123",
  name: "Premium Product",
  shortDescription: "Highest quality product in its class",
  description: "This is our premium product with advanced features...",
  image: "/product-hero.jpg",
  category: "Premium",
  tags: ["quality", "premium", "bestseller"],
  price: 99.99,
  inStock: true,
  rating: {
    value: 4.8,
    count: 124,
  },
};

export default function ProductDetailPage() {
  const productSEO = getDynamicSEO("product", mockProduct);
  const schemaData = generateStructuredData("product", mockProduct);
  const breadcrumbs = generateBreadcrumbs("/products/123");

  return (
    <>
      {/* Primary SEO Template */}
      <SEOTemplate {...productSEO} />

      {/* Additional Helmet tags for advanced SEO */}
      <Helmet>
        {/* Robots meta */}
        <meta name="robots" content={getRobotsMeta("/products")} />

        {/* Schema.org Structured Data - Product */}
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>

        {/* Schema.org Structured Data - Breadcrumbs */}
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbs)}
        </script>

        {/* Additional meta tags */}
        <meta name="product-id" content={mockProduct.id} />
        <meta property="product:price:amount" content={mockProduct.price} />
        <meta property="product:price:currency" content="USD" />
      </Helmet>

      {/* Page Content */}
      <div className="product-detail">
        <h1>{mockProduct.name}</h1>
        <p>{mockProduct.description}</p>
        <p className="price">${mockProduct.price}</p>
        <button>Add to Cart</button>
      </div>
    </>
  );
}
