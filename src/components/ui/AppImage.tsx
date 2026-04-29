'use client';

import React, { useState, useCallback, useMemo, memo } from 'react';
import Image from 'next/image';

interface AppImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  fill?: boolean;
  sizes?: string;
  onClick?: () => void;
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
  unoptimized?: boolean;
  [key: string]: unknown;
}

const AppImage = memo(function AppImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  fill = false,
  sizes,
  onClick,
  fallbackSrc = '/assets/images/no_image.png',
  loading = 'lazy',
  unoptimized = false,
  ...props
}: AppImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // External URLs: let Next.js optimize them via remotePatterns (unoptimized=false by default)
  // Only force unoptimized if caller explicitly requests it
  const resolvedUnoptimized = unoptimized;

  const handleError = useCallback(() => {
    if (!hasError && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(true);
    }
  }, [hasError, imageSrc, fallbackSrc]);

  const imageClassName = useMemo(() => {
    const classes = [className];
    if (onClick) classes.push('cursor-pointer hover:opacity-90 transition-opacity duration-200');
    return classes.filter(Boolean).join(' ');
  }, [className, onClick]);

  const commonProps = {
    src: imageSrc,
    alt: alt || 'Image',
    className: imageClassName,
    quality,
    placeholder,
    unoptimized: resolvedUnoptimized,
    onError: handleError,
    onClick,
    // priority images are eager-loaded; non-priority respect the loading prop
    ...(priority ? { priority: true, loading: 'eager' as const } : { loading }),
    ...(blurDataURL && placeholder === 'blur' ? { blurDataURL } : {}),
  };

  if (fill) {
    return (
      <Image
        {...commonProps}
        alt={alt || 'Image'}
        fill
        sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
        style={{ objectFit: 'cover' }}
        {...props}
      />
    );
  }

  return (
    <Image
      {...commonProps}
      alt={alt || 'Image'}
      width={width || 400}
      height={height || 300}
      sizes={sizes}
      {...props}
    />
  );
});

AppImage.displayName = 'AppImage';

export default AppImage;
