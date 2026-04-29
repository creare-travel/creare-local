import React from 'react';
import Link from 'next/link';

interface ExperienceContentProps {
  intro: string;
  program: string[];
  audience: string[];
}

// Location keywords mapped to their cultural-worlds destination
const LOCATION_LINKS: Record<string, string> = {
  Istanbul: '/cultural-worlds/istanbul',
  Bodrum: '/cultural-worlds/bodrum',
  Cappadocia: '/cultural-worlds/cappadocia',
  Anatolia: '/cultural-worlds/anatolia',
};

/**
 * Splits a text string into React nodes, replacing the FIRST occurrence
 * of up to 2 location keywords with contextual <Link> elements.
 * Keeps the result editorial and natural — never over-links.
 */
function renderWithContextualLinks(text: string): React.ReactNode[] {
  const keywords = Object.keys(LOCATION_LINKS);
  // Build a regex that matches any keyword (word-boundary aware)
  const pattern = new RegExp(`\\b(${keywords.join('|')})\\b`);

  const nodes: React.ReactNode[] = [];
  let remaining = text || '';
  let linksAdded = 0;
  let keyIndex = 0;

  while (remaining.length > 0 && linksAdded < 2) {
    const match = pattern.exec(remaining);
    if (!match) break;

    const keyword = match[1];
    const matchIndex = match.index;

    // Text before the keyword
    if (matchIndex > 0) {
      nodes.push(remaining.slice(0, matchIndex));
    }

    // The contextual link
    nodes.push(
      <Link
        key={`loc-link-${keyIndex}`}
        href={LOCATION_LINKS[keyword]}
        className="underline underline-offset-2 decoration-neutral-400/60 hover:decoration-neutral-700 transition-colors"
      >
        {keyword}
      </Link>
    );

    remaining = remaining.slice(matchIndex + keyword.length);
    linksAdded++;
    keyIndex++;
  }

  // Append any remaining text
  if (remaining.length > 0) {
    nodes.push(remaining);
  }

  return nodes;
}

export default function ExperienceContent({ intro, program, audience }: ExperienceContentProps) {
  return (
    <div className="space-y-20">
      {/* Narrative Intro */}
      <div className="max-w-2xl">
        <p className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-6">
          The Experience
        </p>
        <p
          className="font-display font-light text-neutral-800 leading-relaxed"
          style={{ fontSize: 'clamp(1rem, 1.5vw, 1.2rem)' }}
        >
          {renderWithContextualLinks(intro)}
        </p>
      </div>

      {/* Program Flow */}
      <div>
        <p className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-8">
          Program
        </p>
        <ol className="space-y-5" aria-label="Experience program">
          {program?.map((step, index) => (
            <li key={index} className="flex items-start gap-5">
              <span className="font-body text-[0.6rem] tracking-[0.15em] text-neutral-300 mt-1 flex-shrink-0 w-5">
                {String(index + 1).padStart(2, '0')}
              </span>
              <p className="font-body text-sm text-neutral-700 leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Audience */}
      <div>
        <p className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-8">
          This Experience Is For
        </p>
        <ul className="space-y-4" aria-label="Intended audience">
          {Array.isArray(audience) &&
            audience.map((item, index) => (
              <li key={index} className="flex items-start gap-4">
                <span
                  className="w-1 h-1 rounded-full bg-neutral-400 mt-2 flex-shrink-0"
                  aria-hidden="true"
                />
                <p className="font-body text-sm text-neutral-700 leading-relaxed">{item}</p>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
