'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function CtaSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef?.current) observer?.observe(sectionRef?.current);
    return () => observer?.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full py-36 md:py-48 flex items-center justify-center"
      style={{ backgroundColor: '#E8E0D5' }}
      aria-label="Private inquiry call to action"
    >
      <div
        className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 text-center transition-all duration-[var(--motion-standard)] ease-[var(--ease-luxury)]"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
        }}
      >
        <p
          className="font-display font-light text-stone-400 uppercase tracking-[0.25em] mb-6"
          style={{ fontSize: 'clamp(0.65rem, 1.2vw, 0.75rem)' }}
        >
          Curated for the few
        </p>
        <p
          className="font-display font-light text-stone-800 leading-tight tracking-tight mb-3"
          style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}
        >
          Some experiences cannot be listed.
        </p>
        <p
          className="font-display font-light text-stone-800 leading-tight tracking-tight mb-14"
          style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}
        >
          Some moments cannot be repeated.
        </p>
        <Link
          href="/contact"
          className="motion-button-editorial inline-block border border-stone-900 bg-white px-10 py-4 font-body text-[0.65rem] uppercase tracking-[0.3em] text-stone-900 hover:bg-stone-900 hover:text-white"
          aria-label="Submit a private inquiry"
        >
          PRIVATE INQUIRY
        </Link>
      </div>
    </section>
  );
}
