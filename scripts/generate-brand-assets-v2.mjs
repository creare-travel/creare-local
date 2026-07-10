import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const palette = {
  black: '#0A0A0A',
  ivory: '#F5F3EF',
  stone: '#D4CFC5',
  charcoal: '#3A3A3A',
  warmGrey: '#8B867E',
  white: '#FFFFFF',
};

const assetRoot = path.join(repoRoot, 'public', 'brand', 'CREARE_MASTER_ASSETS_v2.0');
const zipPath = path.join(repoRoot, 'public', 'brand', 'CREARE_MASTER_ASSETS_v2.0.zip');

const dirs = {
  logos: path.join(assetRoot, 'logos'),
  favicons: path.join(assetRoot, 'favicons'),
  social: path.join(assetRoot, 'social'),
  editorial: path.join(assetRoot, 'editorial'),
};

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function interFont(weight = 400) {
  return `'Inter', 'Helvetica Neue', Arial, sans-serif`;
}

function svgFrame(width, height, inner, background = 'none') {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  ${background === 'none' ? '' : `<rect width="${width}" height="${height}" fill="${background}"/>`}
  ${inner}
</svg>`;
}

function wordmarkMetrics(size) {
  const map = {
    xs: { fontSize: 18, letterSpacingEm: 0.195 },
    sm: { fontSize: 24, letterSpacingEm: 0.195 },
    md: { fontSize: 32, letterSpacingEm: 0.19 },
    lg: { fontSize: 48, letterSpacingEm: 0.185 },
    xl: { fontSize: 64, letterSpacingEm: 0.18 },
    hero: { fontSize: 88, letterSpacingEm: 0.175 },
  };
  return map[size];
}

function descriptorMetrics(size) {
  const map = {
    sm: { fontSize: 8, letterSpacingEm: 0.18, opacityDark: 0.28, opacityLight: 0.32 },
    md: { fontSize: 9, letterSpacingEm: 0.18, opacityDark: 0.28, opacityLight: 0.32 },
    lg: { fontSize: 10, letterSpacingEm: 0.18, opacityDark: 0.28, opacityLight: 0.32 },
  };
  return map[size];
}

function createWordmarkSvg({ color, size = 'md' }) {
  const metric = wordmarkMetrics(size);
  const width = size === 'sm' ? 240 : size === 'md' ? 320 : size === 'lg' ? 480 : size === 'xs' ? 180 : size === 'xl' ? 620 : 820;
  const height = size === 'sm' ? 40 : size === 'md' ? 52 : size === 'lg' ? 72 : size === 'xs' ? 30 : size === 'xl' ? 96 : 130;
  const x = size === 'sm' ? 0 : 0;
  const y = metric.fontSize;
  const ls = `${metric.letterSpacingEm}em`;
  const inner = `
    <text
      x="${x}"
      y="${y}"
      fill="${color}"
      font-family="${interFont(300)}"
      font-size="${metric.fontSize}px"
      font-weight="300"
      letter-spacing="${ls}"
      text-transform="uppercase"
      dominant-baseline="hanging"
    >CREARE</text>
  `;
  return svgFrame(width, height, inner);
}

function createIconSvg({ color = palette.ivory, size = 24, background = null, border = null }) {
  const inner = `
    ${background ? `<rect width="${size}" height="${size}" fill="${background}"/>` : ''}
    ${border ? `<rect x="0.5" y="0.5" width="${size - 1}" height="${size - 1}" fill="none" stroke="${border}"/>` : ''}
    <path
      d="M14 6C10.134 6 7 9.134 7 13C7 16.866 10.134 20 14 20"
      stroke="${color}"
      stroke-width="1.5"
      stroke-linecap="square"
    />
  `;
  return svgFrame(size, size, inner);
}

function wordmarkText(x, y, size, color, anchor = 'start') {
  const metric = wordmarkMetrics(size);
  return `<text x="${x}" y="${y}" fill="${color}" font-family="${interFont(300)}" font-size="${metric.fontSize}px" font-weight="300" letter-spacing="${metric.letterSpacingEm}em" text-anchor="${anchor}" dominant-baseline="hanging">CREARE</text>`;
}

function descriptorText(x, y, size, theme = 'dark', anchor = 'start') {
  const metric = descriptorMetrics(size);
  const opacity = theme === 'dark' ? metric.opacityDark : metric.opacityLight;
  return `<text x="${x}" y="${y}" fill="${palette.warmGrey}" fill-opacity="${opacity}" font-family="${interFont(400)}" font-size="${metric.fontSize}px" font-weight="400" letter-spacing="${metric.letterSpacingEm}em" text-anchor="${anchor}" dominant-baseline="hanging">EXPERIENCE DESIGN STUDIO</text>`;
}

function createLockupSvg({ dark = true }) {
  const bg = dark ? palette.black : palette.ivory;
  const fg = dark ? palette.white : palette.black;
  const descriptorOpacity = dark ? 0.6 : 0.6;
  const inner = `
    <rect width="480" height="76" fill="${bg}"/>
    <g transform="translate(0 22)">
      <svg x="0" y="0" width="32" height="32" viewBox="0 0 48 48">
        <path d="M24 4C12.954 4 4 12.954 4 24C4 35.046 12.954 44 24 44" stroke="${fg}" stroke-width="0.5" stroke-linecap="square"/>
        <path d="M24 10C16.268 10 10 16.268 10 24C10 31.732 16.268 38 24 38" stroke="${fg}" stroke-width="0.5" stroke-linecap="square"/>
      </svg>
      <text x="48" y="0" fill="${fg}" font-family="'Cormorant Garamond', Georgia, serif" font-size="32px" font-weight="300" letter-spacing="0.15em" dominant-baseline="hanging">CREARE</text>
      <text x="48" y="42" fill="${fg}" fill-opacity="${descriptorOpacity}" font-family="${interFont(400)}" font-size="9px" font-weight="400" letter-spacing="0.2em" dominant-baseline="hanging">EXPERIENCE DESIGN STUDIO</text>
    </g>
  `;
  return svgFrame(480, 76, inner);
}

function grainOverlay(width, height) {
  const encoded = `data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E`;
  return `
    <image href="${encoded}" x="0" y="0" width="${width}" height="${height}" opacity="0.015" preserveAspectRatio="none"/>
  `;
}

function createLinkedInBannerSvg(width = 1584, height = 396) {
  const scale = width / 1584;
  const centerX = width / 2;
  const wordmarkY = 152 * scale;
  const descriptorY = wordmarkY + 86 * scale;
  const inner = `
    <defs>
      <linearGradient id="banner-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${palette.black}"/>
        <stop offset="50%" stop-color="#141414"/>
        <stop offset="100%" stop-color="#0F0F0F"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#banner-bg)"/>
    ${wordmarkText(centerX, wordmarkY, 'lg', palette.ivory, 'middle')}
    ${descriptorText(centerX, descriptorY, 'md', 'dark', 'middle')}
    ${grainOverlay(width, height)}
  `;
  return svgFrame(width, height, inner);
}

function createProposalCoverSvg() {
  const width = 2550;
  const height = 3300;
  const pad = 272;
  const tagY = 272;
  const inner = `
    <rect width="${width}" height="${height}" fill="${palette.black}"/>
    ${wordmarkText(pad, pad, 'sm', palette.ivory)}
    ${descriptorText(pad, pad + 42, 'sm', 'dark')}
    <text x="${width - pad}" y="${tagY}" fill="${palette.warmGrey}" fill-opacity="0.35" font-family="${interFont(400)}" font-size="36px" font-weight="400" letter-spacing="0.22em" text-anchor="end" dominant-baseline="hanging">PROPOSAL</text>
    <text x="${pad}" y="1576" fill="${palette.ivory}" font-family="${interFont(300)}" font-size="234px" font-weight="300" letter-spacing="0.015em" dominant-baseline="hanging">Cultural Experience</text>
    <text x="${pad}" y="1845" fill="${palette.ivory}" font-family="${interFont(300)}" font-size="234px" font-weight="300" letter-spacing="0.015em" dominant-baseline="hanging">Design Framework</text>
    <text x="${pad}" y="2416" fill="${palette.ivory}" fill-opacity="0.55" font-family="${interFont(400)}" font-size="54px" font-weight="400" letter-spacing="0.015em" dominant-baseline="hanging">Strategic approach to contemporary experience design, grounded in cultural intelligence and architectural restraint.</text>
    <line x1="${pad}" y1="2860" x2="${width - pad}" y2="2860" stroke="rgba(255,255,255,0.08)"/>
    <text x="${pad}" y="2928" fill="${palette.warmGrey}" fill-opacity="0.4" font-family="${interFont(400)}" font-size="40px" font-weight="400" letter-spacing="0.12em" dominant-baseline="hanging">May 2026</text>
  `;
  return svgFrame(width, height, inner);
}

function createEditorialTitlePageSvg() {
  const width = 2550;
  const height = 3300;
  const pad = 340;
  const inner = `
    <rect width="${width}" height="${height}" fill="${palette.ivory}"/>
    ${wordmarkText(pad, pad, 'xs', palette.black)}
    ${descriptorText(pad, pad + 28, 'sm', 'light')}
    <text x="${pad}" y="1170" fill="${palette.black}" font-family="${interFont(300)}" font-size="288px" font-weight="300" letter-spacing="0.005em" dominant-baseline="hanging">Editorial</text>
    <text x="${pad}" y="1480" fill="${palette.black}" font-family="${interFont(300)}" font-size="288px" font-weight="300" letter-spacing="0.005em" dominant-baseline="hanging">Title Page</text>
    <text x="${pad}" y="2060" fill="${palette.charcoal}" fill-opacity="0.7" font-family="${interFont(400)}" font-size="58px" font-weight="400" letter-spacing="0.015em" dominant-baseline="hanging">An institutional approach to contemporary design thinking, demonstrating cultural intelligence through restraint and precision.</text>
  `;
  return svgFrame(width, height, inner);
}

function createPdfFooterSvg() {
  const inner = `
    <line x1="0" y1="30" x2="1200" y2="30" stroke="${palette.stone}" stroke-width="1"/>
    ${wordmarkText(0, 58, 'xs', palette.black)}
    <text x="1200" y="58" fill="${palette.warmGrey}" fill-opacity="0.55" font-family="${interFont(400)}" font-size="10px" font-weight="400" letter-spacing="0.18em" text-anchor="end" dominant-baseline="hanging">PAGE 01</text>
  `;
  return svgFrame(1200, 90, inner);
}

async function ensureDirs() {
  await fs.mkdir(assetRoot, { recursive: true });
  await Promise.all(Object.values(dirs).map((dir) => fs.mkdir(dir, { recursive: true })));
}

async function write(filePath, content) {
  await fs.writeFile(filePath, content, 'utf8');
}

async function renderPng(svg, width, height, filePath) {
  await sharp(Buffer.from(svg)).resize(width, height, { fit: 'fill' }).png().toFile(filePath);
}

async function metadata(filePath) {
  const meta = await sharp(filePath).metadata();
  return { width: meta.width ?? null, height: meta.height ?? null, format: meta.format ?? null };
}

async function manifest() {
  const content = {
    name: 'CREARE',
    short_name: 'CREARE',
    icons: [
      { src: '/brand/CREARE_MASTER_ASSETS_v2.0/favicons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/brand/CREARE_MASTER_ASSETS_v2.0/favicons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    theme_color: palette.black,
    background_color: palette.black,
    display: 'standalone',
  };
  await write(path.join(dirs.favicons, 'site.webmanifest'), JSON.stringify(content, null, 2));
}

async function makeZip() {
  try {
    await fs.unlink(zipPath);
  } catch {}
  execFileSync('zip', ['-r', zipPath, 'CREARE_MASTER_ASSETS_v2.0'], {
    cwd: path.join(repoRoot, 'public', 'brand'),
    stdio: 'ignore',
  });
}

async function main() {
  await ensureDirs();

  const outputs = [];

  const wordmarkBlack = createWordmarkSvg({ color: palette.black, size: 'md' });
  const wordmarkIvory = createWordmarkSvg({ color: palette.ivory, size: 'md' });
  const symbolBlack = createIconSvg({ color: palette.black, size: 24 });
  const symbolIvory = createIconSvg({ color: palette.ivory, size: 24 });
  const lockupDark = createLockupSvg({ dark: true });
  const lockupLight = createLockupSvg({ dark: false });
  const faviconSvg = createIconSvg({ color: palette.ivory, size: 64, background: palette.black, border: palette.stone });
  const pdfFooter = createPdfFooterSvg();

  const svgWrites = [
    ['logos/CREARE_Wordmark_Black.svg', wordmarkBlack],
    ['logos/CREARE_Wordmark_Ivory.svg', wordmarkIvory],
    ['logos/CREARE_Symbol_Black.svg', symbolBlack],
    ['logos/CREARE_Symbol_Ivory.svg', symbolIvory],
    ['logos/CREARE_Lockup_Dark.svg', lockupDark],
    ['logos/CREARE_Lockup_Light.svg', lockupLight],
    ['favicons/favicon.svg', faviconSvg],
    ['editorial/pdf-footer.svg', pdfFooter],
  ];

  for (const [relative, content] of svgWrites) {
    const absolute = path.join(assetRoot, relative);
    await write(absolute, content);
    outputs.push({ path: absolute, format: 'svg' });
  }

  const faviconPngs = [
    ['favicon-16x16.png', 16, 16],
    ['favicon-32x32.png', 32, 32],
    ['favicon-48x48.png', 48, 48],
    ['apple-touch-icon.png', 180, 180],
    ['android-chrome-192x192.png', 192, 192],
    ['android-chrome-512x512.png', 512, 512],
  ];

  for (const [file, width, height] of faviconPngs) {
    const absolute = path.join(dirs.favicons, file);
    await renderPng(faviconSvg, width, height, absolute);
    outputs.push({ path: absolute, format: 'png', width, height });
  }

  const social = [
    ['open-graph-image.png', createLinkedInBannerSvg(1200, 630), 1200, 630],
    ['linkedin-banner-dark.png', createLinkedInBannerSvg(1584, 396), 1584, 396],
    ['profile-image-square.png', createIconSvg({ color: palette.ivory, size: 400, background: palette.black, border: palette.stone }), 400, 400],
  ];

  for (const [file, svg, width, height] of social) {
    const absolute = path.join(dirs.social, file);
    await renderPng(svg, width, height, absolute);
    outputs.push({ path: absolute, format: 'png', width, height });
  }

  const editorial = [
    ['proposal-cover-dark.png', createProposalCoverSvg(), 2550, 3300],
    ['editorial-title-page.png', createEditorialTitlePageSvg(), 2550, 3300],
  ];

  for (const [file, svg, width, height] of editorial) {
    const absolute = path.join(dirs.editorial, file);
    await renderPng(svg, width, height, absolute);
    outputs.push({ path: absolute, format: 'png', width, height });
  }

  await manifest();
  outputs.push({ path: path.join(dirs.favicons, 'site.webmanifest'), format: 'webmanifest' });

  await makeZip();
  outputs.push({ path: zipPath, format: 'zip' });

  const verified = [];
  for (const item of outputs) {
    if (item.format === 'png') {
      verified.push({ ...item, ...(await metadata(item.path)) });
    } else {
      verified.push(item);
    }
  }

  console.log(JSON.stringify({ assetRoot, zipPath, files: verified }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
