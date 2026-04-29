import React from 'react';

export default function TaglineSection() {
  return (
    <section className="w-full bg-beige" aria-label="Brand tagline">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-24 lg:py-32">
        <p
          className="font-display font-light leading-snug tracking-tight text-ink"
          style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)' }}
        >
          Beyond borders,
          <br />
          individually tailored to you.
        </p>
      </div>
    </section>
  );
}
