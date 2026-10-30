// Builds the scroll-video frames: source/videos/video{1..5}.mov → WebP in public/frames/<version>/.
// macOS only (AVFoundation decodes the HEVC alpha layer). Needs cwebp: `brew install webp`.
// Usage: npm run frames            (writes public/frames/v2)
//        npm run frames -- v3      (when frames change, bump the version here and FRAMES_VERSION in src/lib/frames.ts)
import { execFile, execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync } from "node:fs";
import { cpus } from "node:os";
import { promisify } from "node:util";

const run = promisify(execFile);
const version = process.argv[2] ?? "v2";
const cache = ".frames-cache";
const out = `public/frames/${version}`;

// Must match the frame geometry in src/lib/frames.ts
const FRAME_W = 1920;
const FRAME_H = 1080;
const PORTRAIT_W = 810;
const cropX = (FRAME_W - PORTRAIT_W) / 2;
const quality = ["-quiet", "-q", "80", "-alpha_q", "80", "-m", "6"];

try {
  execFileSync("cwebp", ["-version"], { stdio: "ignore" });
} catch {
  console.error("cwebp not found. Install it with: brew install webp");
  process.exit(1);
}

// 1. Extract 150 lossless PNG frames per video (kept out of git in .frames-cache/)
mkdirSync(cache, { recursive: true });
execFileSync("swiftc", ["-O", "scripts/extract-frames.swift", "-o", `${cache}/extract-frames`], { stdio: "inherit" });
execFileSync(`${cache}/extract-frames`, ["source/videos", `${cache}/png`], { stdio: "inherit" });

// 2. Encode two WebP sets with transparency: the full frame for landscape screens, and the
//    810×1080 centre for portrait screens (all a canvas cropped to cover a portrait screen shows)
rmSync(out, { recursive: true, force: true });
const jobs = [];
for (let v = 1; v <= 5; v++) {
  for (const set of ["landscape", "portrait"]) mkdirSync(`${out}/${set}/video${v}`, { recursive: true });
  for (const file of readdirSync(`${cache}/png/video${v}`).filter((f) => f.endsWith(".png"))) {
    const n = file.match(/(\d+)\.png$/)[1];
    const src = `${cache}/png/video${v}/${file}`;
    jobs.push([...quality, src, "-o", `${out}/landscape/video${v}/${n}.webp`]);
    jobs.push([...quality, "-crop", `${cropX}`, "0", `${PORTRAIT_W}`, `${FRAME_H}`, src, "-o", `${out}/portrait/video${v}/${n}.webp`]);
  }
}

let done = 0;
const total = jobs.length;
const worker = async () => {
  while (jobs.length) {
    await run("cwebp", jobs.pop());
    if (++done % 300 === 0) console.log(`Encoded ${done}/${total} frames`);
  }
};
await Promise.all(Array.from({ length: cpus().length }, worker));
console.log(`Done: ${done} WebP frames in ${out}/`);
