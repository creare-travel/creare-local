import Link from 'next/link';
import legalPages from '@/data/russian-legal-pages.json';
import philosophyCopy from '@/data/russian-philosophy.json';
import { LocalizedLegalPage, type LegalPageContent } from '@/features/static-pages/legal';
import { localizePathname } from '@/lib/i18n/pathname';

export type RussianLegalPageKey = 'privacy' | 'cookies' | 'terms';

function buildLegalContent(page: RussianLegalPageKey): LegalPageContent {
  const source = legalPages[page];
  return {
    breadcrumb: source.breadcrumb,
    title: source.title,
    lastUpdated: source.lastUpdated,
    sections: source.sections.map(({ number, heading, body }) => ({
      number,
      heading,
      body,
    })),
  };
}

export const russianPrivacyContent = buildLegalContent('privacy');
export const russianCookiesContent = buildLegalContent('cookies');
export const russianTermsContent = buildLegalContent('terms');

export function RussianLegalPage({ page }: { page: RussianLegalPageKey }) {
  const source = legalPages[page];
  return (
    <LocalizedLegalPage
      locale="ru"
      content={buildLegalContent(page)}
      breadcrumbAriaLabel={source.breadcrumbAriaLabel}
      homeLabel={source.homeLabel}
    />
  );
}

const copy = philosophyCopy as Record<string, string>;
const t = (order: number) => copy[String(order)];

const philosophySections = [
  {
    number: t(6),
    title: t(7),
    paragraphs: [t(8), t(9), t(10), t(11)],
  },
  {
    number: t(12),
    title: t(13),
    paragraphs: [t(14), t(15), t(16), t(17), [t(18), t(19), t(20), t(21)]],
  },
  {
    number: t(22),
    title: t(23),
    paragraphs: [t(24), [t(25), t(26)], t(27), [t(28), t(29), t(30)]],
  },
  {
    number: t(31),
    title: t(32),
    paragraphs: [t(33), t(34), t(35), t(36), [t(37), t(38), t(39)], [t(40), t(41)]],
  },
] as const;
export function RussianPhilosophyPage() {
  return (
    <main className="min-h-screen bg-black">
      <section className="flex min-h-[86vh] items-center px-8 sm:min-h-[92vh] sm:px-16 lg:min-h-screen lg:px-24">
        <div className="max-w-[760px]">
          <p className="mb-12 font-body text-[0.7rem] uppercase tracking-[0.22em] text-white/15">
            {t(1)}
          </p>
          <h1 className="font-display text-[clamp(2rem,4.6vw,4.4rem)] font-light leading-[1.18] text-white">
            {t(2)}
            <br /> {t(3)}
            <br /> {t(4)}
            <br /> <span className="text-white/60">{t(5)}</span>
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-[660px] px-8 pb-40 sm:px-16 lg:px-0">
        <div className="flex flex-col gap-32">
          {philosophySections.map((section, sectionIndex) => (
            <div
              key={section.number}
              className={sectionIndex === 2 ? 'border-t border-white/6 pt-24 md:pt-28' : ''}
            >
              <p className="mb-9 font-body text-[0.7rem] uppercase tracking-[0.2em] text-white/16">
                {section.number}
              </p>
              <h2 className="mb-12 font-display text-3xl font-light text-white md:text-4xl">
                {section.title}
              </h2>
              <div className="flex flex-col gap-8 font-body text-base font-light leading-[2] text-white/60">
                {section.paragraphs.map((paragraph, paragraphIndex) =>
                  typeof paragraph === 'string' ? (
                    <p key={`${section.number}-${paragraphIndex}`}>{paragraph}</p>
                  ) : (
                    <p key={`${section.number}-${paragraphIndex}`} className="leading-[2.4]">
                      {paragraph.map((line, lineIndex) => (
                        <span key={line} className="block">
                          {lineIndex === paragraph.length - 1 ? (
                            <span className="text-white/45">{line}</span>
                          ) : (
                            line
                          )}
                        </span>
                      ))}
                    </p>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-black" aria-label={t(44)}>
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 sm:px-10 sm:py-14 lg:flex-row lg:items-center lg:justify-between lg:px-16 lg:py-16">
          <h2
            className="font-display font-light leading-tight text-white"
            style={{ fontSize: 'clamp(1.45rem, 2.2vw, 2rem)' }}
          >
            {t(45)}
            <br />
            {t(46)}
          </h2>
          <Link
            href={localizePathname('/contact', 'ru')}
            className="inline-flex min-h-11 items-center justify-center self-start border border-white/16 px-7 py-3 font-body text-[0.62rem] uppercase tracking-[0.28em] text-white/72 transition-colors duration-300 hover:border-white/32 hover:text-white"
          >
            {t(47)}
          </Link>
        </div>
      </section>
    </main>
  );
}
