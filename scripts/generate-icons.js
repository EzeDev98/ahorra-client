// Generates every app icon from one source image. Run with: npm run icons
// Source: assets/icon-source.png (preferred) or assets/icon-source.svg. Square, artwork inside the central 80%.
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('..', import.meta.url));
const outDir = `${root}public/icons/`;

// Opaque icons (maskable, Apple) are placed on this colour. Matches the manifest background_color.
const BACKGROUND = '#203C93';

const source = ['icon-source.png', 'icon-source.svg'].map((name) => `${root}assets/${name}`).find(existsSync);
if (!source) throw new Error('No source image. Add assets/icon-source.png or assets/icon-source.svg.');

const targets = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'icon-maskable-512.png', size: 512, opaque: true },
  { file: 'apple-touch-icon.png', size: 180, opaque: true },
  { file: 'favicon-32.png', size: 32 },
];

await mkdir(outDir, { recursive: true });

for (const { file, size, opaque } of targets) {
  let image = sharp(source).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });
  if (opaque) image = image.flatten({ background: BACKGROUND });
  await image.png().toFile(`${outDir}${file}`);
  console.log(`public/icons/${file}  ${size}x${size}`);
}
