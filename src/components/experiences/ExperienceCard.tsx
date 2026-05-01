import React, { memo } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import type { Experience } from '@/lib/experiences';

interface ExperienceCardProps {
  experience: Experience;
}

const ExperienceCard = memo(function ExperienceCard({ experience }: ExperienceCardProps) {
  const href = experience.slug ? `/experiences/${experience.slug}` : null;

  const card = (
    <>
      {/* Image */}
      <div className="relative w-full overflow-hidden rounded-xl aspect-[4/3] mb-5">
        <AppImage
          src={experience.heroImage}
          alt={experience.heroImageAlt}
          fill
          loading="lazy"
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Category badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className="font-body text-[0.55rem] tracking-[0.28em] text-white uppercase bg-black/60 backdrop-blur-sm px-3 py-1.5">
            {experience.category}
          </span>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 mb-3">
        <span className="font-body text-[0.6rem] tracking-[0.2em] text-neutral-400 uppercase">
          {experience.location}
        </span>
        <span className="w-px h-3 bg-neutral-300" aria-hidden="true" />
        <span className="font-body text-[0.6rem] tracking-[0.2em] text-neutral-400 uppercase">
          {experience.duration}
        </span>
      </div>

      {/* Title */}
      <h3
        className="font-display font-light text-neutral-900 leading-snug mb-3 group-hover:opacity-70 transition-opacity duration-300"
        style={{ fontSize: 'clamp(1.1rem, 2vw, 1.35rem)' }}
      >
        {experience.title}
      </h3>

      {/* Intro excerpt */}
      <p className="font-body text-sm text-neutral-500 leading-relaxed line-clamp-2 mb-4">
        {experience.intro}
      </p>

      {/* CTA */}
      <span className="font-body text-[0.6rem] tracking-[0.28em] text-neutral-900 uppercase group-hover:opacity-50 transition-opacity duration-300">
        EXPLORE →
      </span>
    </>
  );

  return href ? (
    <Link href={href} className="group block" aria-label={`View ${experience.title}`}>
      {card}
    </Link>
  ) : (
    <div className="group block" aria-label={experience.title}>
      {card}
    </div>
  );
});

ExperienceCard.displayName = 'ExperienceCard';

export default ExperienceCard;
