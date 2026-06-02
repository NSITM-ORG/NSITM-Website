/**
 * seo-config.js — Centralised SEO Configuration
 * ===============================================
 * All page-level SEO defaults live here. Import and use with useHeadSEO
 * or getSEOConfig to get the config object for any route.
 *
 * WHY A CENTRAL CONFIG?
 *   Keeping SEO data out of your components means:
 *   - One place to update titles, descriptions, and keywords
 *   - Consistent formatting across the whole app
 *   - Easy to hand off to a content/marketing team
 *
 * -----------------------------------------------------------------------
 * STATIC USAGE (for fixed pages like /about, /login):
 *
 *   import { SEO_CONFIG } from "../hooks/main-seo";
 *   import { useHeadSEO } from "../hooks/main-seo";
 *
 *   export default function AboutPage() {
 *     useHeadSEO(SEO_CONFIG.about);
 *     return <h1>About Us</h1>;
 *   }
 *
 * DYNAMIC USAGE (for pages where data comes from an API, e.g. product pages):
 *
 *   import { getSEOConfig } from "../hooks/main-seo";
 *
 *   export default function ProductPage({ product }) {
 *     useHeadSEO(getSEOConfig("product", { name: product.name, price: product.price }));
 *     return <h1>{product.name}</h1>;
 *   }
 * -----------------------------------------------------------------------
 *
 * NOTE: The "title" values here are the page-specific portion only.
 * The useHeadSEO hook appends " — A Prime Mart" automatically.
 * So title: "About Us" becomes "About Us — A Prime Mart" in the browser tab.
 */

export const SEO_CONFIG = {
    // ─── Landing & Discovery ───────────────────────────────────────────────

    home: {
        title: "Home",
        description:
            "Welcome to A Prime Mart. Discover amazing products and deals. Shop now!",
        keywords: "e-commerce, shopping, products, deals, discounts",
        type: "website",
    },

    shop: {
        title: "Shop Products",
        description:
            "Browse our wide selection of products. Find exactly what you're looking for.",
        keywords: "shop, browse, products, categories",
        type: "website",
    },

    // ─── Authentication ─────────────────────────────────────────────────────

    login: {
        title: "Login",
        description:
            "Sign in to your A Prime Mart account. Access your orders, wishlist, and more.",
        keywords: "login, sign in, account",
        type: "website",
    },

    signup: {
        title: "Sign Up",
        description: "Create a new A Prime Mart account. Start shopping today!",
        keywords: "signup, register, account creation",
        type: "website",
    },

    // ─── User Dashboard ─────────────────────────────────────────────────────

    panel: {
        title: "Dashboard",
        description: "Manage your account, orders, and settings.",
        keywords: "dashboard, account, orders, settings",
        type: "website",
    },

    orders: {
        title: "My Orders",
        description: "View and track your orders. Check order status and history.",
        keywords: "orders, order tracking, history",
        type: "website",
    },

    wishlist: {
        title: "My Wishlist",
        description: "Your saved items. Add to cart and checkout anytime.",
        keywords: "wishlist, saved items, favorites",
        type: "website",
    },

    checkout: {
        title: "Checkout",
        description: "Complete your purchase. Secure payment processing.",
        keywords: "checkout, cart, payment",
        type: "website",
    },

    // ─── Dynamic Pages ──────────────────────────────────────────────────────

    /**
     * Product page SEO — call as a function, not an object.
     *
     * Example:
     *   useHeadSEO(SEO_CONFIG.product("iPhone 15 Pro", "$1,099"));
     *   // or via getSEOConfig:
     *   useHeadSEO(getSEOConfig("product", { name: "iPhone 15 Pro", price: "$1,099" }));
     */
    product: (productName, price) => ({
        title: productName,
        description: `Buy ${productName} at A Prime Mart. Price: ${price}. Fast delivery, authentic products.`,
        keywords: `${productName}, buy, price, product`,
        type: "product",
    }),

    // ─── Informational ──────────────────────────────────────────────────────

    about: {
        title: "About Us",
        description: "Learn about A Prime Mart. Our mission, values, and team.",
        keywords: "about, company, mission, values",
        type: "website",
    },

    contact: {
        title: "Contact Us",
        description: "Get in touch with our team. We're here to help!",
        keywords: "contact, support, email, phone",
        type: "website",
    },

    help: {
        title: "Help & Support",
        description:
            "Get help with your orders, account, and more. Contact our support team.",
        keywords: "help, support, faq, contact",
        type: "website",
    },
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * getSEOConfig — Helper to resolve static or dynamic SEO configs
 * ==============================================================
 * Handles both plain object configs (static pages) and function-based
 * configs (dynamic pages like product pages that need runtime data).
 *
 * Falls back to the home config if the page type is not found.
 *
 * @param {string} pageType - A key from SEO_CONFIG (e.g. "product", "about")
 * @param {object} [params] - For dynamic pages: { name, price, ... }
 * @returns {object} A resolved SEO config object ready for useHeadSEO
 *
 * @example
 *   // Static page
 *   getSEOConfig("about")
 *   // → { title: "About Us", description: "...", ... }
 *
 *   // Dynamic page
 *   getSEOConfig("product", { name: "MacBook Pro", price: "$1,999" })
 *   // → { title: "MacBook Pro", description: "Buy MacBook Pro at ...", ... }
 */
export function getSEOConfig(pageType, params = {}) {
    const config = SEO_CONFIG[pageType];

    if (typeof config === "function") {
        return config(params.name, params.price);
    }

    return config || SEO_CONFIG.home;
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * STRUCTURED_DATA — JSON-LD Schema Factories
 * ===========================================
 * JSON-LD is a format that tells search engines extra details about your page
 * content — enabling "rich results" in Google Search (star ratings, prices,
 * breadcrumbs displayed directly in search results).
 *
 * Use with the useStructuredData hook from useHeadSEO:
 *
 *   import { useStructuredData, STRUCTURED_DATA } from "../hooks/main-seo";
 *
 *   export default function ProductPage({ product }) {
 *     useStructuredData(STRUCTURED_DATA.product({
 *       name: product.name,
 *       description: product.description,
 *       image: product.imageUrl,
 *       price: product.price,
 *       currency: "USD",
 *       inStock: product.stock > 0,
 *       url: window.location.href,
 *       brand: product.brand,
 *       rating: { value: product.rating, count: product.reviewCount },
 *     }));
 *   }
 *
 * Each factory returns a plain object. useStructuredData serialises it
 * into a <script type="application/ld+json"> tag and injects it into <head>.
 */
export const STRUCTURED_DATA = {
    /**
     * Organization schema — describes the business itself.
     * Add this once on the home page or in a global layout.
     *
     * @returns {object} JSON-LD Organization schema
     */
    organization: () => ({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "A Prime Mart",
        url: typeof window !== "undefined" ? window.location.origin : "",
        description: "Your premier e-commerce platform",
        sameAs: [
            "https://www.facebook.com/aprimeMart",
            "https://www.twitter.com/aprimeMart",
            "https://www.instagram.com/aprimeMart",
        ],
    }),

    /**
     * Product schema — enables price, availability, and rating rich results.
     *
     * @param {object} productData
     * @param {string}  productData.name        - Product name
     * @param {string}  productData.description - Product description
     * @param {string}  productData.image       - Absolute URL to product image
     * @param {number|string} productData.price - Numeric price
     * @param {string}  [productData.currency]  - ISO 4217 code, default "USD"
     * @param {boolean} [productData.inStock]   - Availability flag, default true
     * @param {string}  [productData.url]       - Canonical product URL
     * @param {string}  [productData.brand]     - Brand name
     * @param {object}  [productData.rating]    - { value: number, count: number }
     * @returns {object} JSON-LD Product schema
     */
    product: (productData) => ({
        "@context": "https://schema.org",
        "@type": "Product",
        name: productData.name,
        description: productData.description,
        image: productData.image,
        brand: {
            "@type": "Brand",
            name: productData.brand || "A Prime Mart",
        },
        offers: {
            "@type": "Offer",
            url:
                productData.url ||
                (typeof window !== "undefined" ? window.location.href : ""),
            priceCurrency: productData.currency || "USD",
            price: productData.price,
            // "OutOfStock" must be the full schema.org URL — bug fixed from original
            availability:
                productData.inStock !== false
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
        },
        ...(productData.rating && {
            aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: productData.rating.value,
                reviewCount: productData.rating.count,
            },
        }),
    }),

    /**
     * Breadcrumb schema — displays a navigation trail in search results.
     *
     * @param {Array<{name: string, url: string}>} items - Ordered list of breadcrumb steps
     * @returns {object} JSON-LD BreadcrumbList schema
     *
     * @example
     *   STRUCTURED_DATA.breadcrumb([
     *     { name: "Home", url: "https://aprimeMart.com" },
     *     { name: "Electronics", url: "https://aprimeMart.com/electronics" },
     *     { name: "Laptops", url: "https://aprimeMart.com/electronics/laptops" },
     *   ])
     */
    breadcrumb: (items) => ({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    }),
};

export default SEO_CONFIG;