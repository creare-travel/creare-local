import Link from 'next/link';

export default function UnderConstruction() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16 sm:px-10 lg:px-16">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.09),transparent_36%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.05),transparent_42%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_22%,transparent_78%,rgba(255,255,255,0.04))]"
          aria-hidden="true"
        />

        <div className="relative z-10 w-full max-w-3xl border border-white/10 bg-white/[0.03] px-8 py-14 text-center shadow-[0_0_80px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:px-12 sm:py-16">
          <p className="mb-8 font-body text-[0.62rem] uppercase tracking-[0.38em] text-white/35">
            CREARE
          </p>

          <h1 className="mb-8 font-display text-[clamp(2.5rem,5vw,4.8rem)] font-light leading-[1.05] tracking-tight text-white">
            Access is being prepared.
          </h1>

          <p className="mx-auto mb-12 max-w-2xl font-body text-sm leading-relaxed text-white/60 sm:text-base">
            CREARE is finalizing a private portfolio of experiences designed for a limited circle of
            clients.
          </p>

          <div className="mx-auto h-px w-20 bg-white/10" aria-hidden="true" />

          <div className="mt-12 space-y-3">
            <p className="font-body text-[0.7rem] uppercase tracking-[0.28em] text-white/35">
              For private inquiries:
            </p>
            <Link
              href="mailto:direct@crearetravel.com"
              className="font-body text-sm text-white/80 transition-colors duration-300 hover:text-white sm:text-base"
            >
              direct@crearetravel.com
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
