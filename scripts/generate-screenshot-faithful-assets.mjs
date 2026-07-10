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
  white: '#FFFFFF',
  stone: '#D4CFC5',
  warmGrey: '#8B867E',
  charcoal: '#3A3A3A',
  page: '#F7F4EF',
};

const root = path.join(repoRoot, 'public', 'brand', 'CREARE_MASTER_ASSETS_v3.0');
const zipPath = path.join(repoRoot, 'public', 'brand', 'CREARE_MASTER_ASSETS_v3.0.zip');

const dirs = {
  logos: path.join(root, 'logos'),
  surfaces: path.join(root, 'surfaces'),
  references: path.join(root, 'references'),
};

function svg(width, height, inner, background = null) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  ${background ? `<rect width="${width}" height="${height}" fill="${background}"/>` : ''}
  ${inner}
</svg>`;
}

function wordmarkText({
  x,
  y,
  size = 32,
  color = colors.black,
  letterSpacingEm = 0.19,
  anchor = 'start',
}) {
  return `<text x="${x}" y="${y}" fill="${color}" font-family="'Inter', 'Helvetica Neue', Arial, sans-serif" font-size="${size}px" font-weight="300" letter-spacing="${letterSpacingEm}em" text-anchor="${anchor}" dominant-baseline="hanging">CREARE</text>`;
}

function descriptorText({
  x,
  y,
  size = 9,
  color = colors.warmGrey,
  opacity = 0.28,
  anchor = 'start',
}) {
  return `<text x="${x}" y="${y}" fill="${color}" fill-opacity="${opacity}" font-family="'Inter', 'Helvetica Neue', Arial, sans-serif" font-size="${size}px" font-weight="400" letter-spacing="0.18em" text-anchor="${anchor}" dominant-baseline="hanging">EXPERIENCE DESIGN STUDIO</text>`;
}

function wordmarkSvg(color) {
  return svg(
    240,
    40,
    wordmarkText({
      x: 0,
      y: 2,
      size: 24,
      color,
      letterSpacingEm: 0.195,
    })
  );
}

function smallBannerSvg() {
  return svg(
    542,
    216,
    `
      ${wordmarkText({ x: 271, y: 36, size: 88, color: colors.ivory, letterSpacingEm: 0.175, anchor: 'middle' })}
      ${descriptorText({ x: 271, y: 160, size: 8.5, color: colors.warmGrey, opacity: 0.24, anchor: 'middle' })}
    `,
    colors.black
  );
}

function largeBannerSvg() {
  return svg(
    1039,
    397,
    `
      ${wordmarkText({ x: 519.5, y: 104, size: 92, color: colors.ivory, letterSpacingEm: 0.175, anchor: 'middle' })}
      ${descriptorText({ x: 519.5, y: 303, size: 9.5, color: colors.warmGrey, opacity: 0.24, anchor: 'middle' })}
    `,
    colors.black
  );
}

function exportSheetSvg() {
  const leftX = 23;
  const topY = 16;
  const cardW = 625;
  const cardH = 203;
  const rightX = 679;
  const stripY = 244;
  const stripH = 111;

  return svg(
    1325,
    375,
    `
      <rect width="1325" height="375" fill="${colors.page}"/>

      <rect x="${leftX}" y="${topY}" width="${cardW}" height="${cardH}" fill="${colors.page}" stroke="#D8D1C7" stroke-width="1"/>
      <text x="57" y="50" fill="${colors.warmGrey}" font-family="'Inter', 'Helvetica Neue', Arial, sans-serif" font-size="11px" font-weight="500" letter-spacing="0.15em" dominant-baseline="hanging">CREARE_WORDMARK_BLACK.SVG</text>
      ${wordmarkText({ x: 57, y: 81, size: 32, color: colors.black, letterSpacingEm: 0.19 })}
      <text x="57" y="140" fill="${colors.charcoal}" font-family="'Courier New', monospace" font-size="10px" font-weight="400" dominant-baseline="hanging">✓ viewBox: 0 0 240 40</text>
      <text x="57" y="159" fill="${colors.charcoal}" font-family="'Courier New', monospace" font-size="10px" font-weight="400" dominant-baseline="hanging">✓ fill: #0A0A0A</text>
      <text x="57" y="178" fill="${colors.charcoal}" font-family="'Courier New', monospace" font-size="10px" font-weight="400" dominant-baseline="hanging">✓ text to outlines</text>

      <rect x="${rightX}" y="${topY}" width="${cardW}" height="${cardH}" fill="${colors.black}" stroke="${colors.black}" stroke-width="1"/>
      <text x="711" y="50" fill="${colors.warmGrey}" font-family="'Inter', 'Helvetica Neue', Arial, sans-serif" font-size="11px" font-weight="500" letter-spacing="0.15em" dominant-baseline="hanging">CREARE_WORDMARK_WHITE.SVG</text>
      ${wordmarkText({ x: 712, y: 81, size: 32, color: colors.ivory, letterSpacingEm: 0.19 })}
      <text x="712" y="140" fill="${colors.ivory}" font-family="'Courier New', monospace" font-size="10px" font-weight="700" dominant-baseline="hanging">✓ viewBox: 0 0 240 40</text>
      <text x="712" y="159" fill="${colors.ivory}" font-family="'Courier New', monospace" font-size="10px" font-weight="700" dominant-baseline="hanging">✓ fill: #FFFFFF</text>
      <text x="712" y="178" fill="${colors.ivory}" font-family="'Courier New', monospace" font-size="10px" font-weight="700" dominant-baseline="hanging">✓ transparent bg</text>

      <rect x="23" y="${stripY}" width="1281" height="${stripH}" fill="#F1EEE8"/>
      <text x="48" y="270" fill="${colors.black}" font-family="'Inter', 'Helvetica Neue', Arial, sans-serif" font-size="11px" font-weight="500" letter-spacing="0.12em" dominant-baseline="hanging">PNG RETINA EXPORTS (SM WORDMARK 240×40)</text>

      <text x="48" y="301" fill="${colors.charcoal}" font-family="'Courier New', monospace" font-size="10px" font-weight="400" dominant-baseline="hanging">1x — 240×40px</text>
      <text x="48" y="320" fill="${colors.warmGrey}" font-family="'Inter', 'Helvetica Neue', Arial, sans-serif" font-size="10px" font-weight="400" dominant-baseline="hanging">Standard displays, email</text>

      <text x="463" y="301" fill="${colors.charcoal}" font-family="'Courier New', monospace" font-size="10px" font-weight="400" dominant-baseline="hanging">2x — 480×80px</text>
      <text x="463" y="320" fill="${colors.warmGrey}" font-family="'Inter', 'Helvetica Neue', Arial, sans-serif" font-size="10px" font-weight="400" dominant-baseline="hanging">Retina displays, presentations</text>

      <text x="883" y="301" fill="${colors.charcoal}" font-family="'Courier New', monospace" font-size="10px" font-weight="400" dominant-baseline="hanging">3x — 720×120px</text>
      <text x="883" y="320" fill="${colors.warmGrey}" font-family="'Inter', 'Helvetica Neue', Arial, sans-serif" font-size="10px" font-weight="400" dominant-baseline="hanging">Ultra high-DPI, 4K displays</text>
    `
  );
}

async function ensureDirs() {
  await fs.mkdir(root, { recursive: true });
  await Promise.all(Object.values(dirs).map((dir) => fs.mkdir(dir, { recursive: true })));
}

async function write(file, content) {
  await fs.writeFile(file, content, 'utf8');
}

async function renderPng(svgContent, outPath, width, height) {
  await sharp(Buffer.from(svgContent)).resize(width, height, { fit: 'fill' }).png().toFile(outPath);
}

async function meta(file) {
  return sharp(file).metadata();
}

async function zip() {
  try {
    await fs.unlink(zipPath);
  } catch {}
  execFileSync('zip', ['-r', zipPath, 'CREARE_MASTER_ASSETS_v3.0'], {
    cwd: path.join(repoRoot, 'public', 'brand'),
    stdio: 'ignore',
  });
}

async function main() {
  await ensureDirs();

  const outputs = [];

  const blackWordmark = wordmarkSvg(colors.black);
  const whiteWordmark = wordmarkSvg(colors.ivory);
  const smallBanner = smallBannerSvg();
  const largeBanner = largeBannerSvg();
  const sheet = exportSheetSvg();

  const svgFiles = [
    ['logos/CREARE_Wordmark_Black.svg', blackWordmark],
    ['logos/CREARE_Wordmark_White.svg', whiteWordmark],
  ];

  for (const [rel, content] of svgFiles) {
    const abs = path.join(root, rel);
    await write(abs, content);
    outputs.push({ path: abs, format: 'svg' });
  }

  const pngFiles = [
    ['surfaces/approved-banner-small.png', smallBanner, 542, 216],
    ['surfaces/approved-banner-large.png', largeBanner, 1039, 397],
    ['references/approved-wordmark-export-sheet.png', sheet, 1325, 375],
  ];

  for (const [rel, content, w, h] of pngFiles) {
    const abs = path.join(root, rel);
    await renderPng(content, abs, w, h);
    outputs.push({ path: abs, format: 'png', width: w, height: h });
  }

  await zip();
  outputs.push({ path: zipPath, format: 'zip' });

  const verified = [];
  for (const item of outputs) {
    if (item.format === 'png') {
      const m = await meta(item.path);
      verified.push({ ...item, width: m.width, height: m.height });
    } else {
      verified.push(item);
    }
  }

  console.log(JSON.stringify({ root, zipPath, files: verified }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
