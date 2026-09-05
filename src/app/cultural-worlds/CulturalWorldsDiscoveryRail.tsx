'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';

interface CulturalWorldsDiscoveryRailProps {
  heading: React.ReactNode;
  children: React.ReactNode;
  previousLabel: string;
  nextLabel: string;
  railLabel: string;
}

function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className={direction === 'left' ? 'rotate-180' : undefined}
    >
      <path
        d="M2 6H10"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.75 2.75L10 6L6.75 9.25"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CulturalWorldsDiscoveryRail({
  heading,
  children,
  previousLabel,
  nextLabel,
  railLabel,
}: CulturalWorldsDiscoveryRailProps) {
  const railId = useId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const syncControls = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;

    const maxScrollLeft = Math.max(node.scrollWidth - node.clientWidth, 0);
    setHasOverflow(maxScrollLeft > 8);
    setCanScrollLeft(node.scrollLeft > 8);
    setCanScrollRight(node.scrollLeft < maxScrollLeft - 8);
  }, []);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    node.scrollTo({ left: 0, behavior: 'auto' });
    syncControls();

    const handleScroll = () => syncControls();
    node.addEventListener('scroll', handleScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => syncControls());
    resizeObserver.observe(node);

    const track = node.firstElementChild;
    if (track instanceof HTMLElement) {
      resizeObserver.observe(track);
    }

    window.addEventListener('resize', syncControls);

    return () => {
      node.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
      window.removeEventListener('resize', syncControls);
    };
  }, [syncControls]);

  const scrollByCard = useCallback((direction: 'left' | 'right') => {
    const node = scrollRef.current;
    if (!node) return;

    const firstCard = node.querySelector<HTMLElement>('[data-rail-card="true"]');
    const track = node.firstElementChild instanceof HTMLElement ? node.firstElementChild : null;
    const gapValue = track ? window.getComputedStyle(track).gap : '0';
    const gap = Number.parseFloat(gapValue) || 0;
    const distance = (firstCard?.getBoundingClientRect().width ?? node.clientWidth * 0.8) + gap;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    node.scrollBy({
      left: direction === 'right' ? distance : -distance,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }, []);

  const controlClassName =
    'inline-flex h-9 w-9 items-center justify-center border border-white/12 bg-white/[0.02] text-white/58 transition-colors duration-300 hover:border-white/24 hover:text-white disabled:border-white/8 disabled:text-white/20 disabled:hover:border-white/8 disabled:hover:text-white/20';

  return (
    <div>
      <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>{heading}</div>
        {hasOverflow ? (
          <div className="flex items-center justify-end gap-2 self-end sm:self-auto">
            <button
              type="button"
              aria-controls={railId}
              aria-label={previousLabel}
              onClick={() => scrollByCard('left')}
              disabled={!canScrollLeft}
              className={controlClassName}
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              aria-controls={railId}
              aria-label={nextLabel}
              onClick={() => scrollByCard('right')}
              disabled={!canScrollRight}
              className={controlClassName}
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        ) : null}
      </div>

      <div
        ref={scrollRef}
        id={railId}
        role="region"
        aria-label={railLabel}
        tabIndex={hasOverflow ? 0 : -1}
        className="atlas-scroll overflow-x-auto pb-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        <div className="flex snap-x snap-mandatory gap-6 lg:gap-6">{children}</div>
      </div>
    </div>
  );
}
