'use client';
import React from 'react';

export default function LanguageSelector() {
  return (
    <div
      className="font-body font-medium tracking-[0.18em] text-xs uppercase text-white/60 flex items-center gap-2"
      aria-label="Aktif dil Türkçe"
    >
      <span>TR</span>
      <span className="text-white/25">•</span>
      <span className="text-[0.6rem] tracking-[0.16em] text-white/35">Yakında diğer diller</span>
    </div>
  );
}
