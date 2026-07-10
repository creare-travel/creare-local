import Link from 'next/link';
import { insights } from '@/data/insights';
import type { Insight } from '@/data/insights';
import { shouldUsePublicStaticEnglishFallbacks } from '@/lib/public-content';

const selectedInsightSlugs = [
  'private-life-of-istanbul',
  'bodrum-beyond-the-marina',
  'cappadocia-at-first-light',
] as const;

const selectedInsights = selectedInsightSlugs
  .map((slug) => insights.find((insight) => insight.slug === slug))
  .filter((insight): insight is Insight => Boolean(insight));

export default function SelectedInsightsSection() {
  if (!shouldUsePublicStaticEnglishFallbacks()) {
    return null;
  }

  return (
    <section className="border-t border-white/10 bg-black" aria-label="Homepage selected insights">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 sm:py-24 lg:px-16 lg:py-28">
        <div className="mb-12 max-w-2xl">
          <p className="mb-5 font-body text-[0.66rem] font-medium uppercase tracking-[0.18em] text-white/48">
            Seçilmiş İçgörüler
          </p>
          <p
            className="font-display font-light leading-[1.2] text-white"
            style={{ fontSize: 'clamp(1.65rem, 3vw, 2.35rem)' }}
          >
            Karşılaşmaların arkasındaki dünyaları derinleştiren editoryal okumalar.
          </p>
        </div>

        <div className="border-t border-white/10">
          {selectedInsights.map((insight) => (
            <Link
              key={insight.slug}
              href={`/insights/${insight.slug}`}
              className="group block border-b border-white/10 py-5 transition-colors duration-300 hover:border-white/18"
            >
              <h2
                className="max-w-3xl font-display font-light leading-snug text-white/92 transition-colors duration-300 group-hover:text-white"
                style={{ fontSize: 'clamp(1.1rem, 1.8vw, 1.45rem)' }}
              >
                {insight.title}
              </h2>
              <p className="mt-2 max-w-2xl font-body text-sm leading-relaxed text-white/56 transition-colors duration-300 group-hover:text-white/66">
                {insight.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
