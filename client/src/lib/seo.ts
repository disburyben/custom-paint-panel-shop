/**
 * SEO utilities for meta tags, structured data, and Open Graph
 */

export interface SEOConfig {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
}

/**
 * Generate meta tags for a page
 */
export function generateMetaTags(config: SEOConfig): Record<string, string> {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://casperspaintworks.com.au';
  const url = config.url ? `${baseUrl}${config.url}` : baseUrl;
  const image = config.image ? `${baseUrl}${config.image}` : `${baseUrl}/og-image.jpg`;

  return {
    'og:title': config.title,
    'og:description': config.description,
    'og:image': image,
    'og:url': url,
    'og:type': config.type || 'website',
    'twitter:title': config.title,
    'twitter:description': config.description,
    'twitter:image': image,
    'twitter:card': 'summary_large_image',
  };
}

/**
 * Generate JSON-LD structured data for LocalBusiness
 */
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Caspers Paintworks',
    description: 'Professional automotive refinishing and custom paint services',
    url: 'https://casperspaintworks.com.au',
    telephone: '0466254055',
    email: 'admin@Casperspaintworks.com.au',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '33 Ayfield Road',
      addressLocality: 'Para Hills West',
      addressRegion: 'SA',
      postalCode: '5096',
      addressCountry: 'AU',
    },
    image: 'https://casperspaintworks.com.au/logo.png',
    sameAs: [
      'https://www.facebook.com/casperspaintworks',
      'https://www.instagram.com/casperspaintworks',
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:30',
        closes: '16:30',
      },
    ],
  };
}

/**
 * Generate JSON-LD for Service
 */
export function generateServiceSchema(service: {
  name: string;
  description: string;
  price?: number;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: {
      '@type': 'LocalBusiness',
      name: 'Caspers Paintworks',
    },
    ...(service.price && {
      priceRange: `$${service.price}`,
    }),
    ...(service.image && {
      image: service.image,
    }),
  };
}

/**
 * Generate JSON-LD for BreadcrumbList
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate JSON-LD for Organization
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Caspers Paintworks',
    url: 'https://casperspaintworks.com.au',
    logo: 'https://casperspaintworks.com.au/logo.png',
    description: 'Professional automotive refinishing and custom paint services in Adelaide, South Australia',
    sameAs: [
      'https://www.facebook.com/casperspaintworks',
      'https://www.instagram.com/casperspaintworks',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      telephone: '0466254055',
      email: 'admin@Casperspaintworks.com.au',
    },
  };
}

/**
 * Add JSON-LD script to document head
 */
export function addJsonLdScript(data: any) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

/**
 * Update page title and meta description
 */
export function updatePageMeta(title: string, description: string) {
  document.title = `${title} | Caspers Paintworks`;
  
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    document.head.appendChild(metaDescription);
  }
  metaDescription.setAttribute('content', description);
}
