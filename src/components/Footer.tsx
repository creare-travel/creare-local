'use client';
import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localizePathname } from '@/lib/i18n/pathname';
import { getFooterNavigationRoutes, getLegalNavigationRoutes } from '@/lib/i18n/static-routes';

export default function Footer() {
  const { locale } = useLanguage();
  const dictionary = getDictionary(locale);
  const footerLinks = getFooterNavigationRoutes(locale);
  const legalLinks = getLegalNavigationRoutes(locale);
  const taglineLines = [
    dictionary.footer.tagline_1,
    dictionary.footer.tagline_2,
    dictionary.footer.tagline_3,
  ].filter(Boolean);
  const socialIcons = (
    <>
      <span aria-label="CREARE Instagram profile coming soon" className="text-white/55" role="img">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
        </svg>
      </span>

      <span aria-label="CREARE LinkedIn profile coming soon" className="text-white/55" role="img">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      </span>
    </>
  );

  return (
    <footer className="bg-black" aria-label="Site footer">
      {/* Main footer row */}
      <div className="max-w-7xl mx-auto flex flex-col gap-14 px-6 pb-14 pt-20 sm:px-10 sm:pb-12 sm:pt-18 lg:flex-row lg:items-end lg:justify-between lg:gap-0 lg:px-16">
        {/* Left: Brand + tagline */}
        <div className="max-w-[17rem]">
          <Link
            href={localizePathname('/', locale)}
            aria-label={dictionary.accessibility.returnHome}
          >
            <span className="font-body font-semibold text-[0.75rem] tracking-[0.22em] text-white uppercase">
              CREARE<sup className="text-[0.5rem] align-super tracking-normal">™</sup>
            </span>
          </Link>
          {taglineLines.length > 0 && (
            <p className="mt-5 max-w-[260px] font-display text-[0.82rem] font-light leading-[1.9] text-white/52 sm:text-[0.78rem] sm:leading-loose">
              {taglineLines.map((line, index) => (
                <React.Fragment key={line}>
                  {line}
                  {index < taglineLines.length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
          )}
        </div>

        {/* Right: Nav links + social icons */}
        <nav
          className="flex flex-col items-start gap-8 sm:gap-9 lg:flex-row lg:items-center lg:gap-8"
          aria-label={dictionary.accessibility.mainNavigation}
        >
          {footerLinks.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="font-body text-[0.64rem] tracking-[0.22em] text-white/55 uppercase transition-colors duration-700 hover:text-white/90"
              aria-label={dictionary.global.nav[item.key]}
            >
              {dictionary.global.footer[item.key]}
            </Link>
          ))}

          <div className="flex items-center gap-6 pt-1">{socialIcons}</div>
        </nav>
      </div>
      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto flex flex-col items-start justify-between gap-5 border-t border-white/10 px-6 py-6 sm:px-10 sm:py-5 lg:flex-row lg:items-center lg:gap-0 lg:px-16">
        <span className="font-body text-[0.62rem] tracking-[0.1em] text-white/50">
          {dictionary.footer.copyright}
        </span>
        {legalLinks.length > 0 && (
          <nav
            className="flex flex-wrap items-center gap-x-6 gap-y-3"
            aria-label={dictionary.accessibility.legalLinks}
          >
            {legalLinks.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="font-body text-[0.62rem] tracking-[0.1em] text-white/60 transition-colors duration-700 hover:text-white focus-visible:text-white"
                aria-label={dictionary.global.footer[item.key]}
              >
                {dictionary.global.footer[item.key]}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </footer>
  );
}
