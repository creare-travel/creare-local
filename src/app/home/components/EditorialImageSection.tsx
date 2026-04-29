import React from 'react';
import AppImage from '@/components/ui/AppImage';

export default function EditorialImageSection() {
  return (
    <section className="w-full bg-black py-24 md:py-32" aria-label="Editorial image">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        {/* Thin divider above */}
        <div className="border-t border-white/10 mb-16" aria-hidden="true" />
        {/* Centered architectural image */}
        <div className="max-w-4xl mx-auto">
          <div className="w-full overflow-hidden rounded-xl">
            <AppImage
              src="https://images.unsplash.com/photo-1645020454373-a971bf5e6892"
              alt="Dramatic architectural stone arch corridor with dark atmospheric lighting"
              width={1200}
              height={700}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
