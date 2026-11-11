// Records the run time-lapse (src/components/RunTimelapse.astro) to an MP4.
// Opens the page with ?render in headless Chrome, steps the animation frame
// by frame with window.runTimelapse.seek(t), screenshots each frame over the
// Chrome DevTools Protocol and pipes them into ffmpeg. Needs the dev server
// running, Google Chrome and ffmpeg.
//
//   node scripts/render-timelapse.mjs [pageUrl] [out.mp4] [size] [fps]
//   node scripts/render-timelapse.mjs http://localhost:4321/moving/melbourne/timelapse/ public/videos/melbourne-timelapse.mp4 1080 30
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const [pageUrl = "http://localhost:4321/moving/melbourne/timelapse/", out = "public/videos/melbourne-timelapse.mp4", sizeArg = "1080", fpsArg = "30"] = process.argv.slice(2);
const size = Number(sizeArg);
const fps = Number(fpsArg);
const chromePath = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const port = 9300 + Math.floor(Math.random() * 500);
const profile = mkdtempSync(join(process.env.TMPDIR ?? tmpdir(), "timelapse-chrome-"));

const chrome = spawn(chromePath, [
  "--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  "--hide-scrollbars", "--mute-audio", "--no-first-run", "--no-default-browser-check", `--window-size=${size},${size}`,
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function cdpTarget() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" });
      if (res.ok) return (await res.json()).webSocketDebuggerUrl;
    } catch {}
    await sleep(200);
  }
  throw new Error("Chrome didn't start");
}

let ws;
let nextId = 1;
const pending = new Map();
function send(method, params = {}) {
  const id = nextId++;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}
async function evaluate(expression) {
  const { result, exceptionDetails } = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
  return result.value;
}

try {
  ws = new WebSocket(await cdpTarget());
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    const waiter = pending.get(msg.id);
    if (!waiter) return;
    pending.delete(msg.id);
    msg.error ? waiter.reject(new Error(msg.error.message)) : waiter.resolve(msg.result);
  };

  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: size, height: size, deviceScaleFactor: 1, mobile: false });
  const url = new URL(pageUrl);
  url.searchParams.set("render", "");
  await send("Page.navigate", { url: url.href });
  // Waits for the page (again, if the dev server reloaded it mid-render) to be ready to draw.
  async function pageReady() {
    for (let i = 0; i < 150 && !(await evaluate("Boolean(window.runTimelapse)").catch(() => false)); i++) await sleep(200);
    await evaluate("window.runTimelapse.ready");
    await evaluate("document.fonts.ready.then(() => true)");
    await evaluate("document.querySelector('astro-dev-toolbar')?.remove(), true"); // the dev server's toolbar
    await sleep(1500); // let the last tiles paint
  }
  await pageReady();
  const duration = await evaluate("window.runTimelapse.duration");
  const frames = Math.ceil(duration * fps);
  console.log(`${duration.toFixed(1)} s, ${frames} frames at ${size}×${size}`);

  mkdirSync(dirname(out), { recursive: true });
  const ffmpeg = spawn("ffmpeg", [
    "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-i", "-",
    "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out,
  ], { stdio: ["pipe", "inherit", "inherit"] });
  const ffmpegDone = new Promise((resolve, reject) => ffmpeg.on("close", (code) => (code ? reject(new Error(`ffmpeg exited ${code}`)) : resolve())));

  for (let f = 0; f < frames; f++) {
    let data;
    for (let attempt = 0; ; attempt++) {
      try {
        await evaluate(`(window.runTimelapse.seek(${f / fps}), new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))`);
        ({ data } = await send("Page.captureScreenshot", { format: "jpeg", quality: 92 }));
        // A reload between the seek and the screenshot would capture a fresh, empty page.
        if (await evaluate("Boolean(window.runTimelapse)")) break;
      } catch (error) {
        if (attempt >= 5) throw error;
      }
      console.log(`page reloaded at frame ${f}, waiting for it`);
      await pageReady();
      // A different length means the run data changed; earlier frames would no longer match.
      if ((await evaluate("window.runTimelapse.duration")) !== duration) throw new Error("The time-lapse changed during the render (new run data?); run it again.");
    }
    if (!ffmpeg.stdin.write(Buffer.from(data, "base64"))) await new Promise((r) => ffmpeg.stdin.once("drain", r));
    if (f % (fps * 5) === 0) console.log(`frame ${f}/${frames}`);
  }
  ffmpeg.stdin.end();
  await ffmpegDone;
  console.log(`wrote ${out}`);
} finally {
  ws?.close();
  chrome.kill();
  await sleep(300);
  rmSync(profile, { recursive: true, force: true });
}
