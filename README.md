# Folio, scroll-driven video site

One-page site for Folio, a fictional design studio. Five transparent videos play as you scroll, drawn frame by frame on a canvas behind the page.

Next.js 16 (App Router, static export), React 19, Tailwind v4, GSAP ScrollTrigger, Lenis, Motion.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # prerenders the page to static HTML in ./out
npm run lint     # type-check
```

## Where things live

| Path | What |
|---|---|
| `src/app/layout.tsx` | Fonts (self-hosted by `next/font`), metadata, analytics, first-frame preload. |
| `src/App.tsx` | Page shell: loader, scroll lock, sections. |
| `src/data/content.ts` | Every line of site copy. |
| `src/components/VideoBackground.tsx` | The canvas: which frames load when, and which frame shows at each scroll position. |
| `src/lib/frames.ts` | Frame set version, count and geometry. |
| `public/frames/v2/` | The frames: `landscape/` (1920×1080) and `portrait/` (810×1080 centre crop), WebP with transparency. |
| `scripts/build-frames.mjs` | Rebuilds `public/frames` from the source videos. |

## How the frames load

- Screens wider than 3:4 load the landscape set; narrower ones load the portrait set, which is the only part of the frame they would show anyway.
- The loader opens once every 4th frame of video 1 is in (38 frames, about 1.7 MB). The rest of video 1 and the next video's every-4th frames follow; the other videos load once the visitor scrolls.
- `vercel.json` caches `/frames` for a year, so the folder is versioned.

## Changing the videos

The source videos are not in git. Keep them in `source/videos/video1.mov` … `video5.mov` (HEVC with transparency), then:

```bash
brew install webp        # once, for cwebp
npm run frames -- v3     # writes public/frames/v3
```

Then set `FRAMES_VERSION = "v3"` in `src/lib/frames.ts` and delete `public/frames/v2`. The script needs macOS: it extracts frames with AVFoundation, which decodes the transparency in HEVC video.
