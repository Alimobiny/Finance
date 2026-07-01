// اسکریپت یک‌باره برای ساخت آیکون‌های PWA از روی لوگوی قطب‌نما (SVG).
// اجرا: node scripts/generate-icons.mjs
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const outDir = fileURLToPath(new URL('../public/icons/', import.meta.url));
mkdirSync(outDir, { recursive: true });

const logoSvg = (size, padding = 0) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#1A5276"/>
  <g transform="translate(50 50) scale(${1 - padding / 50})">
    <circle r="26" fill="none" stroke="#F3F1EC" stroke-width="3"/>
    <path d="M0 -22 L7 0 L0 22 L-7 0 Z" fill="#E8A13A"/>
    <circle r="3.5" fill="#F3F1EC"/>
  </g>
</svg>`;

const targets = [
  { name: 'icon-192.png', size: 192, padding: 0 },
  { name: 'icon-512.png', size: 512, padding: 0 },
  { name: 'maskable-512.png', size: 512, padding: 14 }, // فضای امن برای آیکون قابل‌برش
  { name: 'apple-touch-icon.png', size: 180, padding: 0 },
];

for (const t of targets) {
  const svg = Buffer.from(logoSvg(t.size, t.padding));
  await sharp(svg).png().toFile(outDir + t.name);
  console.log('ساخته شد:', t.name);
}

// favicon ساده (همان لوگو در سایز کوچک)
await sharp(Buffer.from(logoSvg(64))).png().toFile(outDir + 'favicon.png');
writeFileSync(fileURLToPath(new URL('../public/favicon.svg', import.meta.url)), logoSvg(64).trim());
console.log('همه آیکون‌ها ساخته شدند.');
