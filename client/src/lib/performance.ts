/**
 * Performance optimization utilities
 */

/**
 * Lazy load images with intersection observer
 */
export function setupLazyLoading() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img);
    });
  }
}

/**
 * Prefetch DNS for external domains
 */
export function prefetchDNS(domains: string[]) {
  domains.forEach((domain) => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  });
}

/**
 * Preconnect to external domains
 */
export function preconnect(domains: string[]) {
  domains.forEach((domain) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = `//${domain}`;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

/**
 * Setup performance monitoring
 */
export function setupPerformanceMonitoring() {
  if ('PerformanceObserver' in window) {
    try {
      // Monitor Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log(`${entry.name}: ${entry.value}ms`);
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (e) {
      console.log('PerformanceObserver not supported');
    }
  }
}

/**
 * Debounce function for event handlers
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for event handlers
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Register service worker for offline support
 */
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  }
}

/**
 * Enable resource hints
 */
export function setupResourceHints() {
  // Prefetch important resources
  const prefetchLinks = [
    { rel: 'prefetch', href: '/api/testimonials' },
    { rel: 'prefetch', href: '/api/services' },
  ];

  prefetchLinks.forEach(({ rel, href }) => {
    const link = document.createElement('link');
    link.rel = rel;
    link.href = href;
    document.head.appendChild(link);
  });
}

/**
 * Get Core Web Vitals
 */
export async function getCoreWebVitals() {
  const vitals: Record<string, number> = {};

  // Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.lcp = lastEntry.renderTime || lastEntry.loadTime;
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // LCP not supported
    }
  }

  // First Input Delay (FID)
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          vitals.fid = entry.processingDuration;
        });
      });
      observer.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // FID not supported
    }
  }

  // Cumulative Layout Shift (CLS)
  let clsValue = 0;
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
      });
      observer.observe({ entryTypes: ['layout-shift'] });
      vitals.cls = clsValue;
    } catch (e) {
      // CLS not supported
    }
  }

  return vitals;
}
