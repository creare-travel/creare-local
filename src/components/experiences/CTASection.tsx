'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { trackCtaClick } from '@/lib/analytics/tracking';

interface CTASectionProps {
  heading?: string;
  subtext?: string;
  buttonLabel?: string;
  buttonHref?: string;
  dark?: boolean;
  experienceSlug?: string;
  experienceTitle?: string;
  source?: string;
}

export default function CTASection({
  heading = 'Begin Your Inquiry',
  subtext = 'Every CREARE experience begins with a conversation. Tell us what you are looking for.',
  buttonLabel = 'PRIVATE INQUIRY',
  buttonHref = '/contact',
  dark = false,
  experienceSlug = undefined,
  experienceTitle = undefined,
  source = 'experience_page',
}: CTASectionProps) {
  const pathname = usePathname();
  const bg = dark ? 'bg-black' : 'bg-[#E8E0D5]';
  const textHeading = dark ? 'text-white' : 'text-neutral-900';
  const textSub = dark ? 'text-white/60' : 'text-neutral-600';
  const btnClass = dark
    ? 'border border-white/60 text-white hover:bg-white hover:text-black'
    : 'bg-black text-white hover:bg-neutral-800';

  // Preserve experience context when routing into the shared contact form flow.
  const resolvedHref =
    buttonHref === '/contact' && experienceSlug
      ? `/contact?source=experience&slug=${encodeURIComponent(experienceSlug)}&exp=${encodeURIComponent(experienceSlug)}`
      : buttonHref;

  const handleCtaClick = () => {
    trackCtaClick({
      label: buttonLabel,
      page_path: pathname,
      experience_slug: experienceSlug,
      source,
    });
  };

  return (
    <section className={`${bg} py-24 md:py-32`} aria-label="Call to action">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
        <p className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-6">
          CREARE
        </p>
        <h2
          className={`font-display font-light ${textHeading} leading-snug tracking-tight mb-6`}
          style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
        >
          {heading}
        </h2>
        <p className={`font-body text-sm ${textSub} leading-relaxed max-w-md mx-auto mb-10`}>
          {subtext}
        </p>
        <p className="font-body text-[0.6rem] tracking-[0.2em] text-neutral-400/70 uppercase mb-6">
          Access is limited and curated.
        </p>
        <Link
          href={resolvedHref}
          onClick={handleCtaClick}
          className={`inline-block font-body text-[0.65rem] tracking-[0.3em] uppercase px-10 py-4 transition-all duration-300 ${btnClass}`}
          aria-label={buttonLabel}
        >
          {buttonLabel}
        </Link>
        {experienceTitle && (
          <div className="mt-5">
            <a
              href={`https://wa.me/+905412203000?text=I'm interested in ${encodeURIComponent(experienceTitle)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-block font-body text-[0.58rem] tracking-[0.2em] uppercase transition-all duration-300 ${dark ? 'text-white/40 hover:text-white/70' : 'text-neutral-400 hover:text-neutral-600'}`}
              aria-label="Contact via WhatsApp"
            >
              Contact via WhatsApp
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
