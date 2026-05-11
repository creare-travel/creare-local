'use client';
import React from 'react';
import Link from 'next/link';

interface InquireCTAProps {
  experienceSlug: string;
  experienceId?: number;
  label?: string;
  className?: string;
}

export default function InquireCTA({
  experienceSlug,
  label = 'INQUIRE PRIVATELY',
  className = '',
}: InquireCTAProps) {
  const href = `/contact?source=experience&slug=${encodeURIComponent(experienceSlug)}&exp=${encodeURIComponent(experienceSlug)}`;

  return (
    <Link
      href={href}
      className={`inline-block font-body text-[0.65rem] tracking-[0.3em] uppercase px-10 py-4 transition-all duration-300 ${className}`}
      aria-label={label}
    >
      {label}
    </Link>
  );
}
