'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { trackCtaClick } from '@/lib/analytics/tracking';
import { buildExperienceInquiryHref } from '@/lib/inquiry';

interface InquireCTAProps {
  experienceSlug: string;
  label?: string;
  className?: string;
}

export default function InquireCTA({
  experienceSlug,
  label = 'ÖZEL OLARAK İLETİŞİME GEÇ',
  className = '',
}: InquireCTAProps) {
  const pathname = usePathname();
  const href = buildExperienceInquiryHref(experienceSlug);

  const handleClick = () => {
    trackCtaClick({
      label,
      page_path: pathname,
      experience_slug: experienceSlug,
      source: 'experience_page',
      cta_position: 'inline',
    });
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`motion-button-editorial inline-block font-body text-[0.65rem] tracking-[0.3em] uppercase px-10 py-4 ${className}`}
      aria-label={label}
    >
      {label}
    </Link>
  );
}
