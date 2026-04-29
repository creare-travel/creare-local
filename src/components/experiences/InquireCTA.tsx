'use client';
import React, { useState } from 'react';
import InquireModal from './InquireModal';

interface InquireCTAProps {
  experienceSlug: string;
  experienceId?: number;
  label?: string;
  className?: string;
}

export default function InquireCTA({
  experienceSlug,
  experienceId,
  label = 'INQUIRE PRIVATELY',
  className = '',
}: InquireCTAProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline-block font-body text-[0.65rem] tracking-[0.3em] uppercase px-10 py-4 transition-all duration-300 ${className}`}
        aria-label={label}
      >
        {label}
      </button>
      <InquireModal
        isOpen={open}
        onClose={() => setOpen(false)}
        experienceSlug={experienceSlug}
        experienceId={experienceId}
      />
    </>
  );
}
