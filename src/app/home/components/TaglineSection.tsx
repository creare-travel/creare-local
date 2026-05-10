import React from 'react';

export default function TaglineSection() {
  return (
    <section className="w-full bg-stone-50" aria-label="Brand tagline">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-24 lg:py-32">
        <h2 className="font-display text-[clamp(1.8rem,3.5vw,3rem)] font-light leading-snug tracking-tight text-neutral-900">
          Beyond borders,
          <br />
          individually tailored to you.
        </h2>
      </div>
    </section>
  );
}
