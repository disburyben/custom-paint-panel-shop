/**
 * Image Optimization Utilities
 * 
 * Provides utilities for image optimization including:
 * - WebP format detection and fallback
 * - Responsive image srcset generation
 * - Image lazy loading
 * - Image quality optimization
 */

/**
 * Check if browser supports WebP format
 */
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
}

/**
 * Cache for WebP support detection
 */
let webpSupported: boolean | null = null;

export function isWebPSupported(): boolean {
  if (webpSupported === null) {
    webpSupported = supportsWebP();
  }
  return webpSupported;
}

/**
 * Get optimized image URL with format conversion
 * 
 * @param imagePath - Original image path
 * @param quality - Quality level (1-100, default 80)
 * @param width - Optional width for resizing
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  imagePath: string,
  quality: number = 80,
  width?: number
): string {
  // If it's already a URL, return as is (can't optimize external URLs)
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Build query parameters for optimization
  const params = new URLSearchParams();
  params.set('q', Math.min(100, Math.max(1, quality)).toString());
  
  if (width) {
    params.set('w', width.toString());
  }

  // Add format parameter if WebP is supported
  if (isWebPSupported()) {
    params.set('f', 'webp');
  }

  return `${imagePath}?${params.toString()}`;
}

/**
 * Generate responsive image srcset
 * 
 * @param imagePath - Base image path
 * @param sizes - Array of widths to generate (e.g., [320, 640, 1024])
 * @param quality - Quality level (1-100)
 * @returns srcset string
 */
export function generateSrcSet(
  imagePath: string,
  sizes: number[] = [320, 640, 1024, 1920],
  quality: number = 80
): string {
  return sizes
    .map((width) => {
      const url = getOptimizedImageUrl(imagePath, quality, width);
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Get image sizes attribute for responsive images
 * 
 * @param breakpoints - Object with breakpoint sizes
 * @returns sizes attribute string
 */
export function getImageSizes(breakpoints?: Record<string, string>): string {
  const defaultSizes = {
    '(max-width: 640px)': '100vw',
    '(max-width: 1024px)': '90vw',
    '(max-width: 1536px)': '80vw',
    'default': '70vw',
  };

  const sizes = { ...defaultSizes, ...breakpoints };
  
  return Object.entries(sizes)
    .filter(([key]) => key !== 'default')
    .map(([query, size]) => `${query} ${size}`)
    .concat(sizes.default)
    .join(', ');
}

/**
 * Calculate aspect ratio for image container
 * 
 * @param width - Image width
 * @param height - Image height
 * @returns Aspect ratio as percentage (for padding-bottom technique)
 */
export function calculateAspectRatio(width: number, height: number): number {
  return (height / width) * 100;
}

/**
 * Get image loading priority
 * 
 * @param priority - Priority level ('high', 'low', 'auto')
 * @returns loading attribute value
 */
export function getImageLoadingAttribute(priority: 'high' | 'low' | 'auto' = 'auto'): 'eager' | 'lazy' {
  return priority === 'high' ? 'eager' : 'lazy';
}

/**
 * Format image file size for display
 * 
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get image compression recommendation based on file size
 * 
 * @param fileSizeKB - File size in KB
 * @returns Compression recommendation
 */
export function getCompressionRecommendation(fileSizeKB: number): {
  quality: number;
  recommendation: string;
} {
  if (fileSizeKB < 50) {
    return { quality: 90, recommendation: 'Excellent - minimal compression needed' };
  } else if (fileSizeKB < 100) {
    return { quality: 85, recommendation: 'Good - light compression recommended' };
  } else if (fileSizeKB < 200) {
    return { quality: 80, recommendation: 'Fair - moderate compression recommended' };
  } else if (fileSizeKB < 500) {
    return { quality: 75, recommendation: 'Poor - significant compression recommended' };
  } else {
    return { quality: 70, recommendation: 'Very Poor - aggressive compression recommended' };
  }
}

/**
 * Preload image for faster rendering
 * 
 * @param imagePath - Image path to preload
 */
export function preloadImage(imagePath: string): void {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = imagePath;
  document.head.appendChild(link);
}

/**
 * Prefetch image for future navigation
 * 
 * @param imagePath - Image path to prefetch
 */
export function prefetchImage(imagePath: string): void {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = imagePath;
  document.head.appendChild(link);
}

/**
 * Get image MIME type
 * 
 * @param imagePath - Image path
 * @returns MIME type
 */
export function getImageMimeType(imagePath: string): string {
  const extension = imagePath.split('.').pop()?.toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
  };

  return mimeTypes[extension || ''] || 'image/jpeg';
}

/**
 * Convert image to WebP format (client-side)
 * Note: This requires server-side support or a service worker
 * 
 * @param imagePath - Original image path
 * @returns WebP image path
 */
export function toWebP(imagePath: string): string {
  if (!isWebPSupported()) {
    return imagePath;
  }

  // Replace extension with .webp
  return imagePath.replace(/\.[^.]+$/, '.webp');
}

/**
 * Create picture element HTML for responsive images with WebP fallback
 * 
 * @param imagePath - Base image path
 * @param alt - Alt text for image
 * @param sizes - Responsive sizes
 * @returns HTML string for picture element
 */
export function createPictureHTML(
  imagePath: string,
  alt: string,
  sizes?: string
): string {
  const webpPath = toWebP(imagePath);
  const srcSet = generateSrcSet(imagePath);
  const webpSrcSet = generateSrcSet(webpPath);
  const imageSizes = sizes || getImageSizes();

  return `
    <picture>
      <source srcset="${webpSrcSet}" type="image/webp" sizes="${imageSizes}">
      <img src="${imagePath}" srcset="${srcSet}" sizes="${imageSizes}" alt="${alt}" loading="lazy">
    </picture>
  `;
}
