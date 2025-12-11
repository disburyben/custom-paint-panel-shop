import { useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  trackPageView,
  trackEvent,
  trackFormSubmission,
  trackContactFormSubmission,
  trackQuoteRequest,
  trackButtonClick,
  trackLinkClick,
  trackGalleryView,
  trackServiceView,
  trackTestimonialView,
  trackScrollDepth,
  trackTimeOnPage,
  trackVideoPlay,
  trackSearch,
  trackError,
  setUserProperties,
  setUserId,
} from '@/lib/ga';

/**
 * useGA4 hook for tracking page views and events
 * 
 * Usage:
 * const { trackEvent, trackFormSubmission } = useGA4();
 */
export function useGA4() {
  const [location] = useLocation();

  // Track page view on route change
  useEffect(() => {
    trackPageView(location, document.title);
  }, [location]);

  // Track scroll depth
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollPercentage = Math.round(
          (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );
        if (scrollPercentage > 0 && scrollPercentage % 25 === 0) {
          trackScrollDepth(scrollPercentage);
        }
      }, 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Track time on page
  useEffect(() => {
    const startTime = Date.now();

    return () => {
      const timeInSeconds = Math.round((Date.now() - startTime) / 1000);
      if (timeInSeconds > 5) {
        // Only track if user spent more than 5 seconds
        trackTimeOnPage(document.title, timeInSeconds);
      }
    };
  }, [location]);

  return {
    trackEvent,
    trackFormSubmission,
    trackContactFormSubmission,
    trackQuoteRequest,
    trackButtonClick,
    trackLinkClick,
    trackGalleryView,
    trackServiceView,
    trackTestimonialView,
    trackScrollDepth,
    trackTimeOnPage,
    trackVideoPlay,
    trackSearch,
    trackError,
    setUserProperties,
    setUserId,
  };
}
