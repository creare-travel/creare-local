import React from 'react';

interface ExperienceMetaProps {
  location: string;
  duration: string;
  groupSize: string;
  category: string;
}

export default function ExperienceMeta({
  location,
  duration,
  groupSize,
  category,
}: ExperienceMetaProps) {
  const items = [
    { label: 'Category', value: category },
    { label: 'Location', value: location },
    { label: 'Duration', value: duration },
    { label: 'Group Size', value: groupSize },
  ];

  return (
    <div className="border-t border-b border-neutral-200 py-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
        {items.map((item) => (
          <div key={item.label}>
            <p className="font-body text-[0.55rem] tracking-[0.28em] text-neutral-400 uppercase mb-2">
              {item.label}
            </p>
            <p className="font-body text-sm text-neutral-900 font-medium tracking-wide">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
