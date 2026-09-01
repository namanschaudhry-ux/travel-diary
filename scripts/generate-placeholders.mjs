// One-off script to generate placeholder gallery photos so the site has
// something to render out of the box. Run with: node scripts/generate-placeholders.mjs
// Delete this file (and the placeholder images) once you've added your own photos.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const destinations = [
  {
    slug: "japan",
    label: "Japan",
    color: "#3a2f28",
    accent: "#d8b26b",
    shots: [
      ["Shibuya Crossing", 1200, 1600],
      ["Fushimi Inari", 1600, 1200],
      ["Arashiyama Bamboo Grove", 1200, 1600],
      ["Osaka at Night", 1600, 1067],
      ["Mount Fuji", 1600, 1067],
      ["Kyoto Backstreets", 1200, 1600],
    ],
  },
  {
    slug: "italy",
    label: "Italy",
    color: "#2b2622",
    accent: "#c98a4b",
    shots: [
      ["Cinque Terre", 1600, 1067],
      ["Roman Forum", 1200, 1600],
      ["Venice Canals", 1200, 1600],
      ["Tuscan Hills", 1600, 1067],
      ["Florence Duomo", 1200, 1600],
      ["Amalfi Coast", 1600, 1067],
    ],
  },
  {
    slug: "iceland",
    label: "Iceland",
    color: "#20262b",
    accent: "#7fb2c9",
    shots: [
      ["Jokulsarlon", 1600, 1067],
      ["Skogafoss", 1200, 1600],
      ["Reynisfjara", 1600, 1067],
      ["Vatnajokull Glacier", 1200, 1600],
      ["Diamond Beach", 1600, 1067],
      ["Kirkjufell", 1200, 1600],
    ],
  },
];

const root = path.join(import.meta.dirname, "..", "src", "assets", "photos");

for (const dest of destinations) {
  const dir = path.join(root, dest.slug);
  await mkdir(dir, { recursive: true });

  for (let i = 0; i < dest.shots.length; i++) {
    const [caption, w, h] = dest.shots[i];
    const svg = `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="${dest.color}" />
            <stop offset="1" stop-color="#0e0d0c" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#g)" />
        <circle cx="${w * 0.78}" cy="${h * 0.24}" r="${Math.min(w, h) * 0.16}" fill="${dest.accent}" opacity="0.35" />
        <text x="${w / 2}" y="${h / 2}" font-family="Georgia, serif" font-size="${w * 0.06}"
          fill="${dest.accent}" text-anchor="middle" opacity="0.9">${dest.label}</text>
        <text x="${w / 2}" y="${h / 2 + w * 0.08}" font-family="Helvetica, Arial, sans-serif"
          font-size="${w * 0.032}" fill="#f4f1ea" text-anchor="middle" opacity="0.8">${caption}</text>
      </svg>`;

    const file = path.join(dir, `${String(i + 1).padStart(2, "0")}.jpg`);
    await sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toFile(file);
    console.log("wrote", file);
  }
}
