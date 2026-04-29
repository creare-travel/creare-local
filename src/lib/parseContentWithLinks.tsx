import Link from 'next/link';
import React from 'react';

/**
 * Parses a content string and replaces [url label] syntax with Next.js Link components.
 * Example: [/experiences/beylerbeyi-1869 Beylerbeyi 1869] → <Link href="/experiences/beylerbeyi-1869">Beylerbeyi 1869</Link>
 */
export function parseContentWithLinks(content: string): React.ReactNode[] {
  const linkPattern = /\[(\S+)\s+([^\]]+)\]/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(content)) !== null) {
    const [fullMatch, url, label] = match;
    const matchStart = match.index;

    // Push text before this match
    if (matchStart > lastIndex) {
      parts.push(content.slice(lastIndex, matchStart));
    }

    // Push the Link component
    parts.push(
      <Link
        key={`${url}-${matchStart}`}
        href={url}
        className="text-white underline underline-offset-2 hover:text-white/70 transition-colors duration-300"
      >
        {label}
      </Link>
    );

    lastIndex = matchStart + fullMatch.length;
  }

  // Push remaining text after last match
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts;
}
