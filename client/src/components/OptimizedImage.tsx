import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';
import {
  isWebPSupported,
  generateSrcSet,
  getImageSizes,
  toWebP,
  getImageLoadingAttribute,
} from '@/lib/imageOptimization';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: 'high' | 'low' | 'auto';
  quality?: number;
  sizes?: string;
  responsiveSizes?: number[];
  className?: string;
  containerClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * OptimizedImage Component
 * 
 * Automatically optimizes images with:
 * - WebP format conversion with fallback
 * - Responsive srcset generation
 * - Lazy loading
 * - Aspect ratio preservation
 * - Loading state management
 * 
 * Usage:
 * <OptimizedImage 
 *   src="/images/photo.jpg" 
 *   alt="Photo"
 *   width={800}
 *   height={600}
 *   priority="high"
 * />
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = 'auto',
  quality = 80,
  sizes,
  responsiveSizes = [320, 640, 1024, 1920],
  className = '',
  containerClassName = '',
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const webpSupported = isWebPSupported();
  const webpSrc = toWebP(src);
  const loading = getImageLoadingAttribute(priority);
  const imageSizes = sizes || getImageSizes();
  const srcSet = generateSrcSet(src, responsiveSizes, quality);
  const webpSrcSet = webpSupported ? generateSrcSet(webpSrc, responsiveSizes, quality) : '';

  // Calculate aspect ratio for container
  const aspectRatio = width && height ? (height / width) * 100 : undefined;

  useEffect(() => {
    // Preload image if priority is high
    if (priority === 'high' && imgRef.current) {
      imgRef.current.loading = 'eager';
    }
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Container with aspect ratio preservation
  const containerStyle: React.CSSProperties = aspectRatio
    ? {
        position: 'relative',
        paddingBottom: `${aspectRatio}%`,
        overflow: 'hidden',
      }
    : {};

  const imgStyle: React.CSSProperties = aspectRatio
    ? {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }
    : {};

  return (
    <div
      ref={containerRef}
      className={`optimized-image-container ${!isLoaded ? 'loading' : 'loaded'} ${containerClassName}`}
      style={containerStyle}
    >
      {/* Placeholder background while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {/* Picture element with WebP support */}
      <picture>
        {webpSupported && (
          <source
            srcSet={webpSrcSet}
            type="image/webp"
            sizes={imageSizes}
          />
        )}
        <source
          srcSet={srcSet}
          sizes={imageSizes}
        />
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={loading}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          style={imgStyle}
          {...props}
        />
      </picture>

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Image failed to load</span>
        </div>
      )}
    </div>
  );
}

/**
 * BackgroundOptimizedImage Component
 * 
 * For use as CSS background images with WebP support
 * 
 * Usage:
 * <BackgroundOptimizedImage 
 *   src="/images/background.jpg"
 *   className="w-full h-96"
 * >
 *   <div>Content over background</div>
 * </BackgroundOptimizedImage>
 */
interface BackgroundOptimizedImageProps {
  src: string;
  alt?: string;
  className?: string;
  children?: React.ReactNode;
  quality?: number;
}

export function BackgroundOptimizedImage({
  src,
  alt = 'Background',
  className = '',
  children,
  quality = 75,
}: BackgroundOptimizedImageProps) {
  const webpSupported = isWebPSupported();
  const webpSrc = toWebP(src);

  const backgroundImage = webpSupported
    ? `url('${webpSrc}')`
    : `url('${src}')`;

  return (
    <div
      className={`relative bg-cover bg-center bg-no-repeat ${className}`}
      style={{
        backgroundImage,
      }}
      role="img"
      aria-label={alt}
    >
      {children}
    </div>
  );
}

/**
 * LazyOptimizedImage Component
 * 
 * Advanced lazy loading with Intersection Observer
 * 
 * Usage:
 * <LazyOptimizedImage 
 *   src="/images/photo.jpg"
 *   alt="Photo"
 *   threshold={0.1}
 * />
 */
interface LazyOptimizedImageProps extends OptimizedImageProps {
  threshold?: number;
  rootMargin?: string;
}

export function LazyOptimizedImage({
  src,
  threshold = 0.1,
  rootMargin = '50px',
  ...props
}: LazyOptimizedImageProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, rootMargin]);

  return (
    <div ref={ref}>
      {shouldLoad ? (
        <OptimizedImage src={src} {...props} />
      ) : (
        // Placeholder
        <div
          className="bg-muted animate-pulse"
          style={{
            aspectRatio: props.width && props.height ? `${props.width}/${props.height}` : 'auto',
          }}
        />
      )}
    </div>
  );
}
