type BlurAtmosphere = 'dark' | 'light' | 'neutral';
type BlurProfile = 'hero' | 'editorial';

interface LqipOptions {
  atmosphere?: BlurAtmosphere;
  profile?: BlurProfile;
}

const PALETTES: Record<BlurAtmosphere, string[][]> = {
  dark: [
    ['#090909', '#17181b', '#2a2d33'],
    ['#0d0d0c', '#1d1b18', '#34302b'],
    ['#101214', '#202226', '#393d43'],
  ],
  light: [
    ['#f3eee6', '#e6dccf', '#c9bcab'],
    ['#f6f1ea', '#e7ddd2', '#d0c3b4'],
    ['#f4efe8', '#dfd5c9', '#c7b8a7'],
  ],
  neutral: [
    ['#e7dfd4', '#cfc5b8', '#afa191'],
    ['#e5ddd1', '#c8beb1', '#a89380'],
    ['#e9e1d8', '#d4c8bb', '#b8a897'],
  ],
};

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function buildCinematicBlurDataUrl(src: string, options: LqipOptions = {}) {
  const atmosphere = options.atmosphere ?? 'neutral';
  const profile = options.profile ?? 'hero';
  const hash = hashString(src || `${atmosphere}:${profile}`);
  const palette = PALETTES[atmosphere][hash % PALETTES[atmosphere].length];

  const opacityPrimary = profile === 'hero' ? 0.94 : 0.88;
  const opacitySecondary = profile === 'hero' ? 0.64 : 0.56;
  const opacityTertiary = profile === 'hero' ? 0.34 : 0.28;
  const x1 = 20 + (hash % 16);
  const y1 = 18 + ((hash >> 3) % 18);
  const x2 = 76 - ((hash >> 5) % 16);
  const y2 = 72 - ((hash >> 7) % 18);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 20" preserveAspectRatio="none">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${palette[0]}"/>
          <stop offset="52%" stop-color="${palette[1]}"/>
          <stop offset="100%" stop-color="${palette[2]}"/>
        </linearGradient>
        <filter id="b">
          <feGaussianBlur stdDeviation="1.8"/>
        </filter>
      </defs>
      <rect width="32" height="20" fill="url(#g)"/>
      <ellipse cx="${x1}" cy="${y1}" rx="13" ry="8" fill="${palette[1]}" opacity="${opacityPrimary}" filter="url(#b)"/>
      <ellipse cx="${x2}" cy="${y2}" rx="11" ry="7" fill="${palette[2]}" opacity="${opacitySecondary}" filter="url(#b)"/>
      <ellipse cx="16" cy="10" rx="18" ry="10" fill="${palette[0]}" opacity="${opacityTertiary}" filter="url(#b)"/>
    </svg>
  `
    .replace(/\s{2,}/g, ' ')
    .trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
