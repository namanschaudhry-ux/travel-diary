import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const W = 1200;
const H = 680;

const placeholders = [
  { file: "novablast-5-winter-sea.png", bg: "#1f4b57", accent: "#8fd3c7", label: "ASICS Novablast 5", sub: "Winter Sea" },
  { file: "novablast-5-tokyo.png", bg: "#c8102e", accent: "#ffffff", label: "ASICS Novablast 5", sub: "Tokyo" },
  { file: "zoom-fly-6-kipchoge.png", bg: "#1a1a1a", accent: "#ff6a13", label: "Nike Zoom Fly 6", sub: "Eliud Kipchoge" },
  { file: "nimbus-22-red-black.png", bg: "#111111", accent: "#d31027", label: "ASICS GEL-Nimbus 22", sub: "Red / Black" },
  { file: "nb-nyc-marathon-2024.png", bg: "#00274d", accent: "#ff8200", label: "New Balance", sub: "NYC Marathon 2024" },
];

const svg = ({ bg, accent, label, sub }) => `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" rx="24" fill="${bg}" />
  <ellipse cx="${W / 2}" cy="${H / 2 + 40}" rx="360" ry="90" fill="${accent}" opacity="0.18" />
  <text x="50%" y="46%" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="46" font-weight="700" fill="${accent}">${label}</text>
  <text x="50%" y="58%" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="30" fill="#ffffff" opacity="0.85">${sub}</text>
  <text x="50%" y="92%" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="18" letter-spacing="2" fill="#ffffff" opacity="0.5">PLACEHOLDER — REPLACE WITH PHOTO</text>
</svg>`;

await mkdir("src/assets/shoes", { recursive: true });

for (const p of placeholders) {
  await sharp(Buffer.from(svg(p))).png().toFile(`src/assets/shoes/${p.file}`);
  console.log("wrote", p.file);
}
