'use client';

import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';
import Image from 'next/image';
import {
  cloudinaryLoader,
  normalizeCloudinaryAsset,
  type CloudinaryDeliveryProfile,
} from '@/lib/cloudinary';

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
  atmosphere?: 'light' | 'dark' | 'neutral';
  deliveryProfile?: CloudinaryDeliveryProfile;
  [key: string]: unknown;
}

const AppImage = memo(function AppImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality,
  placeholder = 'empty',
  blurDataURL,
  fill = false,
  sizes,
  onClick,
  fallbackSrc = '/assets/images/creare-image-placeholder.jpg',
  loading = 'lazy',
  unoptimized = false,
  atmosphere = 'neutral',
  deliveryProfile = 'default',
  ...props
}: AppImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setImageSrc(src);
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  // External URLs: let Next.js optimize them via remotePatterns (unoptimized=false by default)
  // Only force unoptimized if caller explicitly requests it
  const resolvedUnoptimized = unoptimized;
  const normalizedAsset = useMemo(
    () => normalizeCloudinaryAsset(imageSrc, { profile: deliveryProfile }),
    [deliveryProfile, imageSrc]
  );
  const resolvedPlaceholder = blurDataURL ? 'blur' : placeholder;
  const loader = useMemo(
    () =>
      normalizedAsset.isCloudinary
        ? (loaderProps: Parameters<typeof cloudinaryLoader>[0]) =>
            cloudinaryLoader(loaderProps, { profile: normalizedAsset.profile })
        : undefined,
    [normalizedAsset.isCloudinary, normalizedAsset.profile]
  );

  const handleError = useCallback(() => {
    if (!hasError && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(true);
      setIsLoaded(false);
    }
  }, [hasError, imageSrc, fallbackSrc]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const imageClassName = useMemo(() => {
    const placeholderSurface =
      atmosphere === 'dark'
        ? 'bg-[linear-gradient(135deg,rgba(21,22,24,0.96),rgba(34,36,39,0.92))]'
        : atmosphere === 'light'
          ? 'bg-[linear-gradient(135deg,rgba(245,241,234,0.98),rgba(225,217,206,0.94))]'
          : 'bg-[linear-gradient(135deg,rgba(232,226,216,0.96),rgba(207,198,186,0.92))]';

    const classes = [
      className,
      placeholderSurface,
      'will-change-[opacity,transform,filter] transition-[opacity,transform,filter] duration-[var(--motion-standard)] ease-[var(--ease-luxury)]',
      isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-[1.012] blur-[0.4px]',
    ];
    if (onClick) {
      classes.push(
        'cursor-pointer hover:opacity-90 active:opacity-80 transition-[opacity,transform] duration-[var(--motion-hover)] ease-[var(--ease-luxury)]'
      );
    }
    return classes.filter(Boolean).join(' ');
  }, [atmosphere, className, isLoaded, onClick]);

  const commonProps = {
    src: normalizedAsset.src,
    alt: alt || 'Image',
    className: imageClassName,
    placeholder: resolvedPlaceholder,
    unoptimized: resolvedUnoptimized,
    loader,
    onError: handleError,
    onLoad: handleLoad,
    onClick,
    ...(typeof quality === 'number' ? { quality } : {}),
    // priority images are eager-loaded; non-priority respect the loading prop
    ...(priority ? { priority: true, loading: 'eager' as const } : { loading }),
    ...(blurDataURL && resolvedPlaceholder === 'blur' ? { blurDataURL } : {}),
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
