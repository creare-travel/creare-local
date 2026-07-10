import Link from 'next/link';

const culturalWorlds = [
  {
    title: 'Istanbul',
    subtitle: 'Threshold Civilization',
    href: '/cultural-worlds/istanbul',
  },
  {
    title: 'Cappadocia',
    subtitle: 'Carved Civilization',
    href: '/cultural-worlds/cappadocia',
  },
  {
    title: 'Bodrum',
    subtitle: 'Peninsula Civilization',
    href: '/cultural-worlds/bodrum',
  },
  {
    title: 'Aegean',
    subtitle: 'Maritime Memory',
    status: 'Emerging',
  },
];

export default function CulturalWorldsIndexSection() {
  return (
    <section className="border-t border-white/10 bg-black" aria-label="Homepage cultural worlds">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 sm:py-24 lg:px-16 lg:py-28">
        <div className="mb-12 max-w-2xl">
          <p className="mb-5 font-body text-[0.66rem] font-medium uppercase tracking-[0.18em] text-white/48">
            Kültürel Dünyalar
          </p>
          <p
            className="mb-6 font-display font-light leading-[1.2] text-white"
            style={{ fontSize: 'clamp(1.65rem, 3vw, 2.35rem)' }}
          >
            CREARE&apos;nin bir yeri okuduğu coğrafya.
          </p>
          <p className="max-w-xl font-body text-sm leading-relaxed text-white/68">
            Her kültürel dünya; hafıza, ritüel, zanaat, peyzaj ve insan deneyiminin yaşayan bir
            sürekliliği olarak ele alınır.
          </p>
        </div>

        <div className="border-t border-white/10">
          {culturalWorlds.map((world) =>
            world.href ? (
              <Link
                key={world.title}
                href={world.href}
                className="group flex items-center justify-between gap-6 border-b border-white/10 py-5 transition-colors duration-300 hover:border-white/18"
              >
                <div className="min-w-0">
                  <h2
                    className="font-display font-light leading-snug text-white/92 transition-colors duration-300 group-hover:text-white"
                    style={{ fontSize: 'clamp(1.15rem, 2vw, 1.55rem)' }}
                  >
                    {world.title}
                  </h2>
                  <p className="mt-1 font-body text-[0.68rem] uppercase tracking-[0.16em] text-white/46 transition-colors duration-300 group-hover:text-white/58">
                    {world.subtitle}
                  </p>
                </div>
                <span className="shrink-0 font-body text-[0.62rem] uppercase tracking-[0.18em] text-white/46 transition-colors duration-300 group-hover:text-white/60">
                  Gir
                </span>
              </Link>
            ) : (
              <div
                key={world.title}
                className="flex items-center justify-between gap-6 border-b border-white/10 py-5"
              >
                <div className="min-w-0">
                  <h2
                    className="font-display font-light leading-snug text-white/92"
                    style={{ fontSize: 'clamp(1.15rem, 2vw, 1.55rem)' }}
                  >
                    {world.title}
                  </h2>
                  <p className="mt-1 font-body text-[0.68rem] uppercase tracking-[0.16em] text-white/46">
                    {world.subtitle}
                  </p>
                </div>
                <span className="shrink-0 font-body text-[0.62rem] uppercase tracking-[0.18em] text-white/36">
                  Gelişiyor
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
