// Generates every app icon from one source image. Run with: npm run icons
// Source: assets/icon-source.png (preferred) or assets/icon-source.svg. Square, artwork inside the central 80%.
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { logoWithShadow } from './logoWithShadow.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const outDir = `${root}public/icons/`;

// Opaque icons (maskable, Apple) are placed on this colour. Matches the manifest background_color.
const BACKGROUND = '#203C93';

const source = ['icon-source.png', 'icon-source.svg'].map((name) => `${root}assets/${name}`).find(existsSync);
if (!source) throw new Error('No source image. Add assets/icon-source.png or assets/icon-source.svg.');

// The plain "A" on a transparent background. The two "any" icons use it: the phone draws its own splash from them.
// The maskable icon, the Apple icon and the favicon stay on the full logo tile.
const markSource = `${root}assets/logo-mark.png`;
if (!existsSync(markSource)) throw new Error('No assets/logo-mark.png. Add the plain "A" on a transparent background.');

const targets = [
  { file: 'icon-192.png', size: 192, mark: true },
  { file: 'icon-512.png', size: 512, mark: true },
  { file: 'apple-touch-icon.png', size: 180, opaque: true },
  { file: 'favicon-32.png', size: 32 },
];

await mkdir(outDir, { recursive: true });

for (const { file, size, opaque, mark } of targets) {
  let image = mark
    ? sharp(await logoWithShadow(markSource, size))
    : sharp(source).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });
  if (opaque) image = image.flatten({ background: BACKGROUND });
  await image.png().toFile(`${outDir}${file}`);
  console.log(`public/icons/${file}  ${size}x${size}`);
}
