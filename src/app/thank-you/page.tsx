import Link from 'next/link';

export const metadata = {
  title: 'Thank You — CREARE',
  description: 'Your inquiry has been received. We will be in touch shortly.',
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <main className="bg-black min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="w-8 h-px bg-white/30 mb-12" />

      <h1 className="font-display text-white font-normal leading-tight mb-6 text-[clamp(2.5rem,5vw,60px)]">
        Thank you.
      </h1>

      <p className="text-white/60 font-body text-base mb-4 max-w-[480px]">
        We have received your inquiry and will be in touch personally.
      </p>

      <p className="text-white/35 font-body text-sm leading-relaxed max-w-[400px] mb-16">
        All inquiries are reviewed with care and handled with strict confidentiality.
      </p>

      <div className="w-8 h-px bg-white/20 mb-12" />

      <Link
        href="/"
        className="text-white/50 font-body text-xs tracking-[0.25em] uppercase hover:text-white transition-colors duration-300"
      >
        Return to CREARE
      </Link>
    </main>
  );
}
