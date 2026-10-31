// Makes public/images/instinct-teal-cities.png from the watch photo: wipes the bezel's
// printed words (CTRL, MENU, ABC, GPS, SET) and engraves a three-letter code for each
// city around the case instead. To add a city, add it to `cities` and run:
//   node scripts/engrave-watch.cjs
const sharp = require("sharp");

// Clockwise from the lower left, just past the gap above the strap; the middle code lands at the top.
const cities = ["NYC", "LDN", "MAD", "BER", "MUC", "JNX", "HAN", "TYO", "MEL", "SYD", "OOL", "NSA", "CHC", "ZQN", "SFO", "SLC", "CHI"];

const source = "public/images/instinct-teal-front.png";
const output = "public/images/instinct-teal-cities.png";
const cx = 626, cy = 589; // centre of the case in the photo
// Polar boxes (angle from the top, clockwise; radius) holding the words to wipe.
const words = [
  { from: 58, to: 88, inner: 318, outer: 358 }, // GPS
  { from: 92, to: 122, inner: 318, outer: 358 }, // SET
  { from: 238, to: 302, inner: 318, outer: 358 }, // ABC, MENU, CTRL
];
const smooth = (t) => t * t * (3 - 2 * t);
// The grey band is widest on the sides, so the codes sit further in there, well clear of the
// outer edge. The two codes beside the gap sit on the lugs, parallel to the dent in the band's
// inner edge. The strip between the lugs is too narrow and dark to read, so the ring leaves a
// gap above the strap.
const radiusAt = (angle) => {
  const fromSide = Math.abs((angle % 180) - 90);
  const fromBottom = Math.abs(angle - 180);
  const band = 347 - 16 * smooth(Math.min(1, Math.max(0, 1 - (fromSide - 15) / 25)));
  return band - 10 * smooth(Math.min(1, Math.max(0, 1 - (fromBottom - 38) / 12)));
};
const gap = 72; // degrees
const step = (360 - gap) / (cities.length - 1);
const angleOf = (n) => (180 + gap / 2 + n * step) % 360;

(async () => {
  const { data, info } = await sharp(source).raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const at = (x, y) => (y * W + x) * C;
  const lum = (x, y) => { const i = at(x, y); return (data[i] + data[i + 1] + data[i + 2]) / 3; };

  // Mask the letters (dark cuts and their pale rims), slightly grown.
  const mask = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const r = Math.hypot(x - cx, y - cy);
    const a = (Math.atan2(x - cx, cy - y) * 180 / Math.PI + 360) % 360;
    if (!words.some((w) => a >= w.from && a <= w.to && r >= w.inner && r <= w.outer)) continue;
    const l = lum(x, y);
    if (l < 96 || l > 150) for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) mask[(y + dy) * W + x + dx] = 1;
  }
  // Refill each masked pixel from the nearest clean bezel at the same radius, on both sides.
  const copy = Buffer.from(data);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!mask[y * W + x]) continue;
    const r = Math.hypot(x - cx, y - cy);
    const a0 = Math.atan2(x - cx, cy - y);
    const sides = [-1, 1].map((side) => {
      for (let step = 1; step < 900; step++) {
        const a = a0 + side * step * 0.0012;
        const sx = Math.round(cx + r * Math.sin(a)), sy = Math.round(cy - r * Math.cos(a));
        if (!mask[sy * W + sx]) return { step, i: at(sx, sy) };
      }
    }).filter(Boolean);
    const total = sides.reduce((sum, s) => sum + 1 / s.step, 0);
    const grain = (Math.random() - 0.5) * 3;
    const i = at(x, y);
    for (let c = 0; c < 3; c++) copy[i + c] = Math.max(0, Math.min(255, sides.reduce((sum, s) => sum + data[s.i + c] / s.step, 0) / total + grain));
  }

  // Engrave: a dark cut, with a pale lip on its lower right where light catches the edge.
  const size = 33;
  const place = (code, n) => {
    const angle = angleOf(n);
    const r = radiusAt(angle), t = angle * Math.PI / 180;
    const x = cx + r * Math.sin(t), y = cy - r * Math.cos(t);
    // Top half reads clockwise with the letters' tops outward; bottom half turns over so it reads the right way up.
    const rotate = angle > 90 && angle < 270 ? angle - 180 : angle;
    return (dx, dy, fill, opacity) => `<text transform="translate(${(x + dx).toFixed(2)} ${(y + dy).toFixed(2)}) rotate(${rotate.toFixed(2)})" y="${size * 0.36}" fill="${fill}" fill-opacity="${opacity}">${code}</text>`;
  };
  const layer = (dx, dy, fill, opacity) => cities.map((code, n) => place(code, n)(dx, dy, fill, opacity)).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><g font-family="DIN Alternate" font-weight="700" font-size="${size}" letter-spacing="1.5" text-anchor="middle" stroke-width="0.8">${layer(0.9, 1.1, "#d9d6d0", 0.3)}${layer(-0.5, -0.5, "#141414", 0.75)}<g stroke="#2a2a2a">${layer(0, 0, "#2a2a2a", 1)}</g></g></svg>`;
  await sharp(copy, { raw: { width: W, height: H, channels: C } })
    .composite([{ input: await sharp(Buffer.from(svg)).blur(0.45).png().toBuffer(), left: 0, top: 0 }])
    .png({ compressionLevel: 9 })
    .toFile(output);
})();
