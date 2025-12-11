/**
 * Google Analytics 4 tracking utilities
 * 
 * Usage:
 * 1. Set GA4_ID environment variable with your Google Analytics 4 Measurement ID
 * 2. Import and use trackEvent, trackPageView, etc. throughout the app
 */

const GA4_ID = import.meta.env.VITE_GA4_ID;

/**
 * Initialize Google Analytics 4
 */
export function initGA4() {
  if (!GA4_ID) {
    console.warn('GA4_ID not configured. Analytics tracking disabled.');
    return;
  }

  // Load GA4 script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', GA4_ID, {
    page_path: window.location.pathname,
    page_title: document.title,
  });

  // Store gtag function globally
  (window as any).gtag = gtag;
}

/**
 * Track page view
 */
export function trackPageView(pagePath: string, pageTitle: string) {
  if (!GA4_ID || !(window as any).gtag) return;

  (window as any).gtag('event', 'page_view', {
    page_path: pagePath,
    page_title: pageTitle,
  });
}

/**
 * Track custom event
 */
export function trackEvent(eventName: string, eventParams?: Record<string, any>) {
  if (!GA4_ID || !(window as any).gtag) return;

  (window as any).gtag('event', eventName, eventParams || {});
}

/**
 * Track form submission
 */
export function trackFormSubmission(formName: string, formData?: Record<string, any>) {
  trackEvent('form_submit', {
    form_name: formName,
    ...formData,
  });
}

/**
 * Track contact form submission (conversion)
 */
export function trackContactFormSubmission(email: string, subject: string) {
  trackEvent('contact_form_submit', {
    email: email,
    subject: subject,
  });

  // Track as conversion
  trackEvent('conversion', {
    conversion_type: 'contact_form',
  });
}

/**
 * Track quote request (conversion)
 */
export function trackQuoteRequest(serviceType: string) {
  trackEvent('quote_request', {
    service_type: serviceType,
  });

  // Track as conversion
  trackEvent('conversion', {
    conversion_type: 'quote_request',
  });
}

/**
 * Track button click
 */
export function trackButtonClick(buttonName: string, buttonLocation?: string) {
  trackEvent('button_click', {
    button_name: buttonName,
    button_location: buttonLocation,
  });
}

/**
 * Track link click
 */
export function trackLinkClick(linkName: string, linkUrl: string) {
  trackEvent('link_click', {
    link_name: linkName,
    link_url: linkUrl,
  });
}

/**
 * Track gallery view
 */
export function trackGalleryView(category?: string) {
  trackEvent('gallery_view', {
    category: category,
  });
}

/**
 * Track service view
 */
export function trackServiceView(serviceName: string) {
  trackEvent('service_view', {
    service_name: serviceName,
  });
}

/**
 * Track testimonial view
 */
export function trackTestimonialView() {
  trackEvent('testimonial_view');
}

/**
 * Track scroll depth
 */
export function trackScrollDepth(depth: number) {
  trackEvent('scroll_depth', {
    scroll_percentage: depth,
  });
}

/**
 * Track time on page
 */
export function trackTimeOnPage(pageName: string, timeInSeconds: number) {
  trackEvent('time_on_page', {
    page_name: pageName,
    time_in_seconds: timeInSeconds,
  });
}

/**
 * Track video play
 */
export function trackVideoPlay(videoName: string) {
  trackEvent('video_play', {
    video_name: videoName,
  });
}

/**
 * Track search
 */
export function trackSearch(searchQuery: string, searchResults: number) {
  trackEvent('search', {
    search_term: searchQuery,
    search_results: searchResults,
  });
}

/**
 * Track error
 */
export function trackError(errorMessage: string, errorCode?: string) {
  trackEvent('error', {
    error_message: errorMessage,
    error_code: errorCode,
  });
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, any>) {
  if (!GA4_ID || !(window as any).gtag) return;

  (window as any).gtag('set', {
    user_properties: properties,
  });
}

/**
 * Track user ID (if available)
 */
export function setUserId(userId: string) {
  if (!GA4_ID || !(window as any).gtag) return;

  (window as any).gtag('config', GA4_ID, {
    user_id: userId,
  });
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
