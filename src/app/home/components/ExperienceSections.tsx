import React from 'react';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';

interface ExperienceCardProps {
  quote: string;
  quoteSubtext?: string;
  image: string;
  alt: string;
  label: string;
  subtitle: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}

function ExperienceCard({
  quote,
  quoteSubtext,
  image,
  alt,
  label,
  subtitle,
  body,
  ctaLabel,
  ctaHref,
}: ExperienceCardProps) {
  return (
    <div className="py-24 md:py-32">
      {/* Centered serif quote */}
      <div className="text-center mb-16">
        <p
          className="font-display font-light text-stone-800 leading-snug tracking-tight whitespace-pre-line"
          style={{ fontSize: 'clamp(1.6rem, 3vw, 2.25rem)' }}
        >
          {quote}
        </p>
        {quoteSubtext && (
          <p className="mt-4 font-body text-stone-500 text-xs tracking-widest">{quoteSubtext}</p>
        )}
      </div>

      {/* Full-width landscape image */}
      <div className="max-w-4xl mx-auto mb-10">
        <div className="w-full overflow-hidden rounded-xl">
          <AppImage
            src={image}
            alt={alt}
            width={1200}
            height={700}
            className="w-full h-auto object-cover"
          />
        </div>
      </div>

      {/* Left-aligned card info */}
      <div className="max-w-4xl mx-auto">
        <p className="font-body font-bold text-sm tracking-[0.2em] uppercase text-stone-900 mb-1">
          {label}
        </p>
        <p className="font-body text-xs tracking-widest text-stone-500 uppercase mb-4">
          {subtitle}
        </p>
        <p className="font-body text-sm text-stone-600 leading-relaxed max-w-md mb-6">{body}</p>
        <Link
          href={ctaHref}
          className="font-body text-[0.65rem] tracking-[0.3em] text-stone-900 uppercase hover:opacity-50 transition-opacity"
          aria-label={ctaLabel}
        >
          {ctaLabel} →
        </Link>
      </div>
    </div>
  );
}

export default function ExperienceSections() {
  return (
    <div className="w-full bg-neutral-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        {/* SIGNATURE™ */}
        <ExperienceCard
          quote={'Certain experiences\nare already curated.'}
          image="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80"
          alt="Panoramic mountain landscape with golden light over misty valleys and peaks"
          label="SIGNATURE™"
          subtitle="Curated Cultural Experiences"
          body="Our most distinguished experiences — refined, tested, and ready to be lived. Each one shaped by years of cultural access and creative intelligence."
          ctaLabel="EXPLORE"
          ctaHref="/experiences/signature"
        />

        {/* Divider */}
        <div className="border-t border-stone-200" aria-hidden="true" />

        {/* LAB™ */}
        <ExperienceCard
          quote={"Every experience\nbegins with the client's intent."}
          image="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80"
          alt="Aerial view of dramatic mountain ridgeline with sweeping valleys and atmospheric haze"
          label="LAB™"
          subtitle="Experience Design"
          body="Where new ideas are shaped into singular experiences. For those who prefer to create rather than simply choose."
          ctaLabel="DISCOVER"
          ctaHref="/experiences/lab"
        />

        {/* Divider */}
        <div className="border-t border-stone-200" aria-hidden="true" />

        {/* BLACK™ */}
        <ExperienceCard
          quote={'Some places\nare not open to everyone.'}
          quoteSubtext="Access is made possible through trust."
          image="https://img.rocket.new/generatedImages/rocket_gen_img_1395015f0-1772853846144.png"
          alt="Dark luxury textured surface with dramatic low lighting and rich black tones"
          label="BLACK™"
          subtitle="Private Access Experiences"
          body="Private access to places, collections, and moments rarely open to everyone."
          ctaLabel="REQUEST PRIVATE ACCESS"
          ctaHref="/experiences/black"
        />
      </div>
    </div>
  );
}
