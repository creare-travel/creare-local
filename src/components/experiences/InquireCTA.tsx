'use client';
import React from 'react';
import Link from 'next/link';
import { buildExperienceInquiryHref } from '@/lib/inquiry';

interface InquireCTAProps {
  experienceSlug: string;
  label?: string;
  className?: string;
}

export default function InquireCTA({
  experienceSlug,
  label = 'INQUIRE PRIVATELY',
  className = '',
}: InquireCTAProps) {
  const href = buildExperienceInquiryHref(experienceSlug);

  return (
    <Link
      href={href}
      className={`motion-button-editorial inline-block font-body text-[0.65rem] tracking-[0.3em] uppercase px-10 py-4 ${className}`}
      aria-label={label}
    >
      {label}
    </Link>
  );
}
