# Image Optimization Guide

This guide explains how to use the image optimization system to improve website performance and loading speeds.

## Overview

The image optimization system provides:

- **WebP Format Conversion** - Automatically serves WebP images to supported browsers with PNG/JPG fallback
- **Responsive Images** - Generates multiple image sizes for different screen sizes
- **Lazy Loading** - Defers image loading until they're needed
- **Automatic Compression** - Optimizes image quality for faster loading
- **Aspect Ratio Preservation** - Prevents layout shift while images load

## Components

### 1. OptimizedImage

Basic optimized image component with WebP support and lazy loading.

```tsx
import OptimizedImage from '@/components/OptimizedImage';

export default function MyComponent() {
  return (
    <OptimizedImage
      src="/images/photo.jpg"
      alt="Beautiful photo"
      width={800}
      height={600}
      priority="high"
      quality={85}
    />
  );
}
```

**Props:**

- `src` (string, required) - Image path
- `alt` (string, required) - Alt text for accessibility
- `width` (number) - Image width for aspect ratio
- `height` (number) - Image height for aspect ratio
- `priority` ('high' | 'low' | 'auto') - Loading priority (default: 'auto')
  - `high` - Eager loading for above-the-fold images
  - `low` - Lazy loading for below-the-fold images
  - `auto` - Browser decides
- `quality` (1-100) - Image quality (default: 80)
- `sizes` (string) - Custom responsive sizes
- `responsiveSizes` (number[]) - Array of widths to generate (default: [320, 640, 1024, 1920])
- `className` (string) - CSS classes for image
- `containerClassName` (string) - CSS classes for container

### 2. BackgroundOptimizedImage

For CSS background images with WebP support.

```tsx
import { BackgroundOptimizedImage } from '@/components/OptimizedImage';

export default function HeroSection() {
  return (
    <BackgroundOptimizedImage
      src="/images/hero-background.jpg"
      alt="Hero background"
      className="w-full h-96"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <h1>Welcome</h1>
      </div>
    </BackgroundOptimizedImage>
  );
}
```

### 3. LazyOptimizedImage

Advanced lazy loading with Intersection Observer for images far down the page.

```tsx
import { LazyOptimizedImage } from '@/components/OptimizedImage';

export default function Gallery() {
  return (
    <LazyOptimizedImage
      src="/images/gallery-item.jpg"
      alt="Gallery item"
      width={400}
      height={300}
      threshold={0.1}
      rootMargin="50px"
    />
  );
}
```

**Props:**

- All OptimizedImage props, plus:
- `threshold` (0-1) - Intersection threshold (default: 0.1)
- `rootMargin` (string) - Margin around viewport (default: '50px')

## Image Optimization Utilities

### isWebPSupported()

Check if browser supports WebP format.

```tsx
import { isWebPSupported } from '@/lib/imageOptimization';

if (isWebPSupported()) {
  console.log('WebP is supported');
}
```

### generateSrcSet()

Generate responsive image srcset.

```tsx
import { generateSrcSet } from '@/lib/imageOptimization';

const srcSet = generateSrcSet(
  '/images/photo.jpg',
  [320, 640, 1024, 1920],
  85
);
// Output: "/images/photo.jpg?w=320&q=85 320w, /images/photo.jpg?w=640&q=85 640w, ..."
```

### getImageSizes()

Get responsive sizes attribute.

```tsx
import { getImageSizes } from '@/lib/imageOptimization';

const sizes = getImageSizes({
  '(max-width: 640px)': '100vw',
  '(max-width: 1024px)': '90vw',
});
```

### toWebP()

Convert image path to WebP format.

```tsx
import { toWebP } from '@/lib/imageOptimization';

const webpPath = toWebP('/images/photo.jpg');
// Output: "/images/photo.webp"
```

### preloadImage() / prefetchImage()

Preload or prefetch images for faster loading.

```tsx
import { preloadImage, prefetchImage } from '@/lib/imageOptimization';

// Preload critical image
preloadImage('/images/hero.jpg');

// Prefetch image for next page
prefetchImage('/images/next-page.jpg');
```

## Best Practices

### 1. Use Priority for Above-the-Fold Images

Images visible on initial page load should use `priority="high"`:

```tsx
<OptimizedImage
  src="/images/hero.jpg"
  alt="Hero"
  priority="high"
/>
```

### 2. Set Width and Height

Always provide width and height to prevent layout shift:

```tsx
<OptimizedImage
  src="/images/photo.jpg"
  alt="Photo"
  width={800}
  height={600}
/>
```

### 3. Use Appropriate Quality Levels

- **Hero/Featured Images**: quality 85-90
- **Gallery Images**: quality 80-85
- **Thumbnails**: quality 70-75

```tsx
<OptimizedImage
  src="/images/hero.jpg"
  quality={90}
/>
```

### 4. Lazy Load Below-the-Fold Images

Use `LazyOptimizedImage` for images far down the page:

```tsx
<LazyOptimizedImage
  src="/images/gallery-item.jpg"
  alt="Gallery item"
/>
```

### 5. Use Responsive Sizes

Customize responsive sizes for your layout:

```tsx
<OptimizedImage
  src="/images/photo.jpg"
  responsiveSizes={[320, 768, 1024, 1920]}
/>
```

## Performance Impact

Expected improvements with image optimization:

- **File Size Reduction**: 30-60% with WebP format
- **Page Load Time**: 20-40% faster
- **Bandwidth Savings**: 40-50% reduction
- **Core Web Vitals**: Improved LCP and CLS scores

## Troubleshooting

### Images Not Showing

1. Check that image path is correct
2. Verify image file exists in `public` folder
3. Check browser console for errors
4. Ensure alt text is provided

### WebP Not Working

1. Check browser support (most modern browsers support WebP)
2. Verify WebP files exist
3. Check network tab to see which format is served

### Slow Loading

1. Reduce quality level (try 75 or 70)
2. Use smaller responsive sizes
3. Ensure images are properly compressed
4. Use lazy loading for below-the-fold images

### Layout Shift

1. Always provide width and height props
2. Use aspect ratio preservation
3. Avoid dynamic image sizing

## Image Formats

### When to Use Each Format

- **WebP** - Best compression, modern browsers (primary format)
- **PNG** - Lossless, transparency support (fallback)
- **JPG** - Good compression for photos (fallback)
- **SVG** - Vector graphics, icons (use directly)

## Server-Side Optimization

For maximum performance, ensure your server:

1. Compresses images with gzip
2. Sets proper cache headers
3. Serves images from CDN
4. Implements image resizing on-the-fly

## Resources

- [Web.dev Image Optimization](https://web.dev/image-optimization/)
- [WebP Format Guide](https://developers.google.com/speed/webp)
- [Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
- [Lazy Loading Images](https://web.dev/lazy-loading-images/)
