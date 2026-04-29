'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { isLocalAssetUrl, mediaUrl } from '@/lib/strapi';

interface GalleryImage {
  url: string;
  alternativeText?: string;
  width?: number;
  height?: number;
}

interface GallerySectionProps {
  images: GalleryImage[];
  strapiBase?: string;
}

function joinBase(base: string, url: string) {
  const normalizedBase = base.replace(/\/+$/, '');
  const normalizedPath = url.startsWith('/') ? url : `/${url}`;
  return `${normalizedBase}${normalizedPath}`;
}

export default function GallerySection({ images, strapiBase }: GallerySectionProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const resolveUrl = (url: string) =>
    url.startsWith('http') ? url : strapiBase ? joinBase(strapiBase, url) : mediaUrl(url);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % images.length);
  }, [lightboxIndex, images.length]);

  const goPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
  }, [lightboxIndex, images.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [lightboxIndex, goNext, goPrev]);

  if (!images || images.length === 0) return null;

  const activeImage = lightboxIndex !== null ? images[lightboxIndex] : null;

  return (
    <>
      <section className="py-20 md:py-28 bg-white" aria-label="Gallery">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <p className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-10">
            Gallery
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
            {images.map((img, i) => {
              const src = resolveUrl(img.url);
              const alt = img.alternativeText ?? `Gallery image ${i + 1}`;
              return (
                <button
                  key={i}
                  onClick={() => openLightbox(i)}
                  className="relative aspect-[4/3] overflow-hidden group focus:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
                  aria-label={`Open ${alt} in lightbox`}
                >
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 33vw"
                    unoptimized={isLocalAssetUrl(src)}
                  />
                  {/* subtle hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-500" />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── LIGHTBOX ── */}
      {activeImage && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-8 font-body text-[0.6rem] tracking-[0.3em] text-white/50 uppercase hover:text-white/90 transition-colors z-10"
            aria-label="Close lightbox"
          >
            Close
          </button>

          {/* Counter */}
          <span className="absolute top-6 left-8 font-body text-[0.6rem] tracking-[0.25em] text-white/30 uppercase">
            {lightboxIndex + 1} / {images.length}
          </span>

          {/* Prev */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-4 sm:left-8 font-body text-white/40 hover:text-white/90 transition-colors text-2xl z-10 p-4"
              aria-label="Previous image"
            >
              ←
            </button>
          )}

          {/* Image */}
          <div
            className="relative w-full max-w-5xl mx-16 sm:mx-24"
            style={{ maxHeight: '85vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full" style={{ paddingBottom: '66.67%' }}>
              <Image
                src={resolveUrl(activeImage.url)}
                alt={activeImage.alternativeText ?? `Gallery image ${lightboxIndex + 1}`}
                fill
                className="object-contain"
                sizes="90vw"
                unoptimized={isLocalAssetUrl(resolveUrl(activeImage.url))}
                priority
              />
            </div>
            {activeImage.alternativeText && (
              <p className="mt-4 text-center font-body text-[0.6rem] tracking-[0.2em] text-white/30 uppercase">
                {activeImage.alternativeText}
              </p>
            )}
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-4 sm:right-8 font-body text-white/40 hover:text-white/90 transition-colors text-2xl z-10 p-4"
              aria-label="Next image"
            >
              →
            </button>
          )}
        </div>
      )}
    </>
  );
}
