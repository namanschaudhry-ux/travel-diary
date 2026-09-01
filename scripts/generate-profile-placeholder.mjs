// One-off script for the About page headshot placeholder.
// Run with: node scripts/generate-profile-placeholder.mjs
// Delete once you've added a real photo at src/assets/profile.jpg.
import sharp from "sharp";
import path from "node:path";

const w = 800;
const h = 1000;
const svg = `
  <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#2b2622" />
        <stop offset="1" stop-color="#0e0d0c" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)" />
    <circle cx="${w / 2}" cy="${h * 0.42}" r="${w * 0.22}" fill="none" stroke="#c9a05b" stroke-width="2" opacity="0.6" />
    <text x="${w / 2}" y="${h * 0.42}" font-family="Georgia, serif" font-size="${w * 0.05}"
      fill="#c9a05b" text-anchor="middle" dominant-baseline="middle" opacity="0.9">Your Photo</text>
  </svg>`;

const file = path.join(import.meta.dirname, "..", "src", "assets", "profile.jpg");
await sharp(Buffer.from(svg)).jpeg({ quality: 85 }).toFile(file);
console.log("wrote", file);
