import { useEffect } from 'react';
import { 
  updatePageMeta, 
  addJsonLdScript, 
  generateLocalBusinessSchema,
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateMetaTags,
  type SEOConfig 
} from '@/lib/seo';

interface SEOHeadProps {
  config: SEOConfig;
  breadcrumbs?: Array<{ name: string; url: string }>;
  includeLocalBusiness?: boolean;
  includeOrganization?: boolean;
}

export function SEOHead({ 
  config, 
  breadcrumbs,
  includeLocalBusiness = true,
  includeOrganization = false,
}: SEOHeadProps) {
  useEffect(() => {
    // Update page title and meta description
    updatePageMeta(config.title, config.description);

    // Add Open Graph and Twitter meta tags
    const metaTags = generateMetaTags(config);
    Object.entries(metaTags).forEach(([name, content]) => {
      let meta = document.querySelector(`meta[property="${name}"]`) || 
                 document.querySelector(`meta[name="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        if (name.startsWith('og:')) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    });

    // Add canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    const baseUrl = window.location.origin;
    canonical.setAttribute('href', config.url ? `${baseUrl}${config.url}` : baseUrl);

    // Add structured data
    if (includeLocalBusiness) {
      addJsonLdScript(generateLocalBusinessSchema());
    }

    if (includeOrganization) {
      addJsonLdScript(generateOrganizationSchema());
    }

    if (breadcrumbs && breadcrumbs.length > 0) {
      addJsonLdScript(generateBreadcrumbSchema(breadcrumbs));
    }

    // Add robots meta tag
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      robots.setAttribute('content', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
      document.head.appendChild(robots);
    }

    // Add viewport meta tag
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
      document.head.appendChild(viewport);
    }

  }, [config, breadcrumbs, includeLocalBusiness, includeOrganization]);

  return null;
}
