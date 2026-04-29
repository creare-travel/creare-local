import React from 'react';
import type { Experience } from '@/lib/experiences';
import ExperienceCard from './ExperienceCard';

interface ExperienceGridProps {
  experiences: Experience[];
  columns?: 2 | 3;
}

export default function ExperienceGrid({ experiences, columns = 3 }: ExperienceGridProps) {
  const gridClass =
    columns === 2
      ? 'grid grid-cols-1 sm:grid-cols-2 gap-10 lg:gap-14'
      : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12';

  return (
    <div className={gridClass}>
      {experiences?.map((experience) => (
        <ExperienceCard key={experience.slug} experience={experience} />
      ))}
    </div>
  );
}
