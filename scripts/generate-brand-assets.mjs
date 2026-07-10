import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const colors = {
  black: '#0A0A0A',
  ivory: '#F5F3EF',
  stone: '#D4CFC5',
  charcoal: '#3A3A3A',
  warmGrey: '#8B867E',
};

const assetRoot = path.join(repoRoot, 'public', 'brand', 'CREARE_MASTER_ASSETS_v1.0');
const logoDir = path.join(assetRoot, 'logos');
const faviconDir = path.join(assetRoot, 'favicons');
const socialDir = path.join(assetRoot, 'social');
const editorialDir = path.join(assetRoot, 'editorial');
const zipPath = path.join(repoRoot, 'public', 'brand', 'CREARE_MASTER_ASSETS_v1.0.zip');

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function makeWordmarkSvg({
  color = colors.black,
  width = 980,
  height = 180,
  background = 'none',
  includeBackground = false,
}) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 980 180" fill="none">
  ${includeBackground ? `<rect width="980" height="180" fill="${background}"/>` : ''}
  <text
    x="48"
    y="114"
    fill="${color}"
    font-family="'Helvetica Neue', Arial, sans-serif"
    font-size="74"
    font-weight="300"
    letter-spacing="14"
  >CREARE</text>
</svg>`;
}

function makeSymbolSvg({
  stroke = colors.black,
  background = 'none',
  includeBackground = false,
  size = 512,
}) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 200 200" fill="none">
  ${includeBackground ? `<rect width="200" height="200" fill="${background}"/>` : ''}
  <g transform="translate(100 100)">
    <path
      d="M34-54C21-62 6-66-12-66c-38 0-68 30-68 68s30 68 68 68c18 0 33-4 46-13"
      stroke="${stroke}"
      stroke-width="12"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path d="M42-34V38" stroke="${stroke}" stroke-width="12" stroke-linecap="round" />
    <path d="M18-52h34" stroke="${stroke}" stroke-width="12" stroke-linecap="round" />
    <path d="M18 56h34" stroke="${stroke}" stroke-width="12" stroke-linecap="round" />
  </g>
</svg>`;
}

function makeLockupSvg({ dark = true }) {
  const bg = dark ? colors.black : colors.ivory;
  const fg = dark ? colors.ivory : colors.black;
  const wordmark = makeWordmarkSvg({
    color: fg,
    width: 980,
    height: 180,
    background: bg,
    includeBackground: false,
  })
    .replace('<?xml version="1.0" encoding="UTF-8"?>', '')
    .replace('<svg xmlns="http://www.w3.org/2000/svg" width="980" height="180" viewBox="0 0 980 180" fill="none">', '')
    .replace('</svg>', '');
  const symbol = makeSymbolSvg({
    stroke: fg,
    size: 200,
    background: bg,
    includeBackground: false,
  })
    .replace('<?xml version="1.0" encoding="UTF-8"?>', '')
    .replace('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" fill="none">', '')
    .replace('</svg>', '');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="320" viewBox="0 0 1280 320" fill="none">
  <rect width="1280" height="320" fill="${bg}"/>
  <g transform="translate(92 60)">
    <g transform="translate(0 0)">${symbol}</g>
    <g transform="translate(210 30)">${wordmark}</g>
  </g>
</svg>`;
}

function makePdfFooterSvg() {
  const wordmark = makeWordmarkSvg({
    color: colors.black,
    width: 980,
    height: 180,
  })
    .replace('<?xml version="1.0" encoding="UTF-8"?>', '')
    .replace('<svg xmlns="http://www.w3.org/2000/svg" width="980" height="180" viewBox="0 0 980 180" fill="none">', '')
    .replace('</svg>', '');
  const symbol = makeSymbolSvg({ stroke: colors.black, size: 200 })
    .replace('<?xml version="1.0" encoding="UTF-8"?>', '')
    .replace('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" fill="none">', '')
    .replace('</svg>', '');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="180" viewBox="0 0 1200 180" fill="none">
  <rect width="1200" height="180" fill="${colors.ivory}"/>
  <line x1="80" y1="90" x2="1120" y2="90" stroke="${colors.stone}" stroke-width="1"/>
  <g transform="translate(84 42) scale(0.48)">${symbol}</g>
  <g transform="translate(168 34) scale(0.84)">${wordmark}</g>
</svg>`;
}

function wrapSvg(width, height, inner, background = 'none') {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  <rect width="${width}" height="${height}" fill="${background}"/>
  ${inner}
</svg>`;
}

function wordmarkGroup({ x, y, scale = 1, color = colors.ivory }) {
  return `<g transform="translate(${x} ${y}) scale(${scale})">${makeWordmarkSvg({ color }).replace('<?xml version="1.0" encoding="UTF-8"?>', '').replace('<svg xmlns="http://www.w3.org/2000/svg" width="980" height="180" viewBox="0 0 980 180" fill="none">', '').replace('</svg>', '')}</g>`;
}

function symbolGroup({ x, y, scale = 1, stroke = colors.ivory }) {
  return `<g transform="translate(${x} ${y}) scale(${scale})">${makeSymbolSvg({ stroke }).replace('<?xml version="1.0" encoding="UTF-8"?>', '').replace('<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 200 200" fill="none">', '').replace('</svg>', '')}</g>`;
}

function textBlock({
  x,
  y,
  lines,
  size,
  fill,
  opacity = 1,
  weight = 300,
  spacing = 0,
  uppercase = false,
  anchor = 'start',
  family = `'Helvetica Neue', Arial, sans-serif`,
  lineHeight = 1.12,
}) {
  const safeLines = lines.map((line) => esc(uppercase ? line.toUpperCase() : line));
  const tspans = safeLines
    .map((line, index) => {
      const dy = index === 0 ? 0 : size * lineHeight;
      return `<tspan x="${x}" dy="${index === 0 ? 0 : dy}">${line}</tspan>`;
    })
    .join('');
  return `<text x="${x}" y="${y}" fill="${fill}" fill-opacity="${opacity}" font-family="${family}" font-size="${size}" font-weight="${weight}" letter-spacing="${spacing}" text-anchor="${anchor}">${tspans}</text>`;
}

function buildOgSvg() {
  const width = 1200;
  const height = 630;
  const inner = `
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${colors.black}"/>
        <stop offset="58%" stop-color="#131313"/>
        <stop offset="100%" stop-color="#171513"/>
      </linearGradient>
      <radialGradient id="glow" cx="78%" cy="20%" r="55%">
        <stop offset="0%" stop-color="rgba(245,243,239,0.09)"/>
        <stop offset="100%" stop-color="rgba(245,243,239,0)"/>
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bg)"/>
    <rect width="${width}" height="${height}" fill="url(#glow)"/>
    <rect x="72" y="72" width="1056" height="486" rx="20" stroke="rgba(245,243,239,0.11)" />
    <line x1="82" y1="90" x2="164" y2="90" stroke="rgba(245,243,239,0.34)" stroke-width="1"/>
    ${textBlock({
      x: 184,
      y: 95,
      lines: ['Curated Cultural Experiences'],
      size: 16,
      fill: colors.ivory,
      opacity: 0.42,
      spacing: 4.5,
      uppercase: true,
      weight: 500,
    })}
    ${wordmarkGroup({ x: 78, y: 470, scale: 0.23, color: colors.ivory })}
    ${textBlock({
      x: 82,
      y: 372,
      lines: ['Experiences.', 'Composed as Art.'],
      size: 72,
      fill: colors.ivory,
      weight: 300,
      family: `'Helvetica Neue', Arial, sans-serif`,
      lineHeight: 1.08,
    })}
    ${textBlock({
      x: 84,
      y: 535,
      lines: ['Private cultural access shaped through context, permission, and pace.'],
      size: 22,
      fill: colors.ivory,
      opacity: 0.52,
      weight: 300,
    })}
  `;
  return wrapSvg(width, height, inner, colors.black);
}

function buildLinkedInSvg() {
  const width = 1584;
  const height = 396;
  const inner = `
    <defs>
      <linearGradient id="bg" x1="0.1" y1="0" x2="0.9" y2="1">
        <stop offset="0%" stop-color="${colors.black}"/>
        <stop offset="65%" stop-color="#141414"/>
        <stop offset="100%" stop-color="#1a1714"/>
      </linearGradient>
      <radialGradient id="wash" cx="82%" cy="18%" r="52%">
        <stop offset="0%" stop-color="rgba(245,243,239,0.08)"/>
        <stop offset="100%" stop-color="rgba(245,243,239,0)"/>
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bg)"/>
    <rect width="${width}" height="${height}" fill="url(#wash)"/>
    <rect x="44" y="44" width="${width - 88}" height="${height - 88}" rx="16" stroke="rgba(245,243,239,0.10)"/>
    ${wordmarkGroup({ x: 360, y: 118, scale: 0.36, color: colors.ivory })}
    ${textBlock({
      x: width / 2,
      y: 268,
      lines: ['Experiences. Composed as Art.'],
      size: 26,
      fill: colors.ivory,
      opacity: 0.55,
      spacing: 1.2,
      weight: 300,
      anchor: 'middle',
    })}
  `;
  return wrapSvg(width, height, inner, colors.black);
}

function buildProfileSvg() {
  const width = 400;
  const height = 400;
  const inner = `
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${colors.black}"/>
        <stop offset="100%" stop-color="#161412"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" rx="44" fill="url(#bg)"/>
    <rect x="20" y="20" width="360" height="360" rx="32" stroke="rgba(245,243,239,0.10)"/>
    ${symbolGroup({ x: 138, y: 84, scale: 0.62, stroke: colors.ivory })}
    ${wordmarkGroup({ x: 68, y: 292, scale: 0.21, color: colors.ivory })}
  `;
  return wrapSvg(width, height, inner, colors.black);
}

function buildProposalSvg() {
  const width = 2550;
  const height = 3300;
  const inner = `
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${colors.black}"/>
        <stop offset="70%" stop-color="#131313"/>
        <stop offset="100%" stop-color="#171513"/>
      </linearGradient>
      <radialGradient id="grainGlow" cx="78%" cy="18%" r="48%">
        <stop offset="0%" stop-color="rgba(245,243,239,0.06)"/>
        <stop offset="100%" stop-color="rgba(245,243,239,0)"/>
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bg)"/>
    <rect width="${width}" height="${height}" fill="url(#grainGlow)"/>
    <rect x="180" y="180" width="${width - 360}" height="${height - 360}" rx="28" stroke="rgba(245,243,239,0.08)"/>
    ${wordmarkGroup({ x: 220, y: 210, scale: 0.36, color: colors.ivory })}
    ${textBlock({
      x: 222,
      y: 430,
      lines: ['Private Cultural Experiences'],
      size: 34,
      fill: colors.ivory,
      opacity: 0.38,
      spacing: 4.8,
      uppercase: true,
      weight: 500,
    })}
    ${textBlock({
      x: 220,
      y: 2300,
      lines: ['Proposal'],
      size: 176,
      fill: colors.ivory,
      weight: 300,
      lineHeight: 1.05,
    })}
    ${textBlock({
      x: 220,
      y: 2485,
      lines: ['Experiences are not booked.', 'They are composed through access, context, and pace.'],
      size: 58,
      fill: colors.ivory,
      opacity: 0.58,
      weight: 300,
      lineHeight: 1.34,
    })}
    ${textBlock({
      x: 222,
      y: 3000,
      lines: ['CREARE'],
      size: 24,
      fill: colors.stone,
      opacity: 0.78,
      spacing: 8.4,
      uppercase: true,
      weight: 500,
    })}
  `;
  return wrapSvg(width, height, inner, colors.black);
}

function buildEditorialSvg() {
  const width = 2550;
  const height = 3300;
  const inner = `
    <rect width="${width}" height="${height}" fill="${colors.ivory}"/>
    <rect x="180" y="180" width="${width - 360}" height="${height - 360}" rx="28" stroke="rgba(10,10,10,0.10)"/>
    ${wordmarkGroup({ x: 220, y: 210, scale: 0.36, color: colors.black })}
    ${textBlock({
      x: 222,
      y: 430,
      lines: ['Editorial Title Page'],
      size: 34,
      fill: colors.warmGrey,
      opacity: 0.82,
      spacing: 4.8,
      uppercase: true,
      weight: 500,
    })}
    ${textBlock({
      x: 220,
      y: 1280,
      lines: ['Context, Permission,', 'Atmosphere'],
      size: 168,
      fill: colors.black,
      weight: 300,
      lineHeight: 1.06,
    })}
    ${textBlock({
      x: 220,
      y: 1680,
      lines: ['Editorial surfaces should read like a cultural institution, a private dossier, or a quiet house of thought.'],
      size: 52,
      fill: colors.charcoal,
      opacity: 0.72,
      weight: 300,
      lineHeight: 1.38,
    })}
    <line x1="220" y1="2840" x2="880" y2="2840" stroke="${colors.stone}" stroke-width="2"/>
    ${textBlock({
      x: 220,
      y: 2950,
      lines: ['CREARE Insights'],
      size: 28,
      fill: colors.warmGrey,
      opacity: 0.88,
      spacing: 4.2,
      uppercase: true,
      weight: 500,
    })}
  `;
  return wrapSvg(width, height, inner, colors.ivory);
}

async function ensureDirs() {
  await fs.mkdir(logoDir, { recursive: true });
  await fs.mkdir(faviconDir, { recursive: true });
  await fs.mkdir(socialDir, { recursive: true });
  await fs.mkdir(editorialDir, { recursive: true });
}

async function writeText(filePath, content) {
  await fs.writeFile(filePath, content, 'utf8');
}

async function renderPng(svg, width, height, filePath) {
  await sharp(Buffer.from(svg))
    .resize(width, height, { fit: 'fill' })
    .png()
    .toFile(filePath);
}

async function metadataFor(filePath) {
  const meta = await sharp(filePath).metadata();
  return { width: meta.width ?? null, height: meta.height ?? null, format: meta.format ?? null };
}

async function writeManifest() {
  const manifest = {
    name: 'CREARE',
    short_name: 'CREARE',
    description: 'Experiences. Composed as Art.',
    icons: [
      { src: '/brand/CREARE_MASTER_ASSETS_v1.0/favicons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/brand/CREARE_MASTER_ASSETS_v1.0/favicons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    theme_color: colors.black,
    background_color: colors.black,
    display: 'standalone',
  };
  await writeText(path.join(faviconDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2));
}

async function createZip() {
  try {
    await fs.unlink(zipPath);
  } catch {}
  execFileSync(
    'zip',
    ['-r', zipPath, 'CREARE_MASTER_ASSETS_v1.0'],
    { cwd: path.join(repoRoot, 'public', 'brand'), stdio: 'ignore' }
  );
}

async function main() {
  await ensureDirs();

  const files = [];

  const wordmarkBlack = makeWordmarkSvg({ color: colors.black });
  const wordmarkIvory = makeWordmarkSvg({ color: colors.ivory });
  const symbolBlack = makeSymbolSvg({ stroke: colors.black });
  const symbolIvory = makeSymbolSvg({ stroke: colors.ivory });
  const lockupDark = makeLockupSvg({ dark: true });
  const lockupLight = makeLockupSvg({ dark: false });
  const faviconSvg = makeSymbolSvg({
    stroke: colors.ivory,
    includeBackground: true,
    background: colors.black,
    size: 512,
  });
  const pdfFooterSvg = makePdfFooterSvg();

  const textAssets = [
    ['logos/CREARE_Wordmark_Black.svg', wordmarkBlack],
    ['logos/CREARE_Wordmark_Ivory.svg', wordmarkIvory],
    ['logos/CREARE_Symbol_Black.svg', symbolBlack],
    ['logos/CREARE_Symbol_Ivory.svg', symbolIvory],
    ['logos/CREARE_Lockup_Dark.svg', lockupDark],
    ['logos/CREARE_Lockup_Light.svg', lockupLight],
    ['favicons/favicon.svg', faviconSvg],
    ['editorial/pdf-footer.svg', pdfFooterSvg],
  ];

  for (const [relative, content] of textAssets) {
    const absolute = path.join(assetRoot, relative);
    await writeText(absolute, content);
    files.push({ path: absolute, format: path.extname(relative).slice(1) });
  }

  const faviconPngs = [
    ['favicon-16x16.png', 16, 16],
    ['favicon-32x32.png', 32, 32],
    ['favicon-48x48.png', 48, 48],
    ['apple-touch-icon.png', 180, 180],
    ['android-chrome-192x192.png', 192, 192],
    ['android-chrome-512x512.png', 512, 512],
  ];

  for (const [name, width, height] of faviconPngs) {
    const absolute = path.join(faviconDir, name);
    await renderPng(faviconSvg, width, height, absolute);
    files.push({ path: absolute, format: 'png', width, height });
  }

  const rasterAssets = [
    ['social/open-graph-image.png', buildOgSvg(), 1200, 630],
    ['social/linkedin-banner-dark.png', buildLinkedInSvg(), 1584, 396],
    ['social/profile-image-square.png', buildProfileSvg(), 400, 400],
    ['editorial/proposal-cover-dark.png', buildProposalSvg(), 2550, 3300],
    ['editorial/editorial-title-page.png', buildEditorialSvg(), 2550, 3300],
  ];

  for (const [relative, svg, width, height] of rasterAssets) {
    const absolute = path.join(assetRoot, relative);
    await renderPng(svg, width, height, absolute);
    files.push({ path: absolute, format: 'png', width, height });
  }

  await writeManifest();
  files.push({ path: path.join(faviconDir, 'site.webmanifest'), format: 'webmanifest' });

  await createZip();
  files.push({ path: zipPath, format: 'zip' });

  const verification = [];
  for (const file of files) {
    if (file.format === 'png') {
      verification.push({ ...file, ...(await metadataFor(file.path)) });
    } else {
      verification.push(file);
    }
  }

  console.log(JSON.stringify({ assetRoot, zipPath, files: verification }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
