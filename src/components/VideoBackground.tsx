/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Multi-video scroll-driven background using canvas frame rendering.
 * Loads 5 WebP frame sequences on demand and maps scrolling zones
 * to video indices and frame indices.
 */

import { motion } from "motion/react";
import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FRAME_H,
  FRAME_W,
  type FrameSet,
  TOTAL_FRAMES,
  VIDEO_COUNT,
  frameUrl,
  pickFrameSet,
} from "../lib/frames";

gsap.registerPlugin(ScrollTrigger);

// Every 4th frame of a video is its "skeleton": enough to scrub without gaps
const SKELETON_STEP = 4;
const MAX_DPR = 2;
const WORKER_COUNT = 6;

type FrameCache = (HTMLImageElement | null)[][];

const isSkeleton = (fIdx: number) => fIdx % SKELETON_STEP === 0;

interface VideoBackgroundProps {
  isLoading: boolean;
  onProgress: (p: number) => void;
  onComplete: () => void;
}

export default function VideoBackground({
  isLoading,
  onProgress,
  onComplete,
}: VideoBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Cache per frame set: framesCache[set][videoIndex][frameIndex]
    const emptyCache = (): FrameCache =>
      Array.from({ length: VIDEO_COUNT }, () => Array(TOTAL_FRAMES).fill(null));
    const framesCache: Record<FrameSet, FrameCache> = {
      landscape: emptyCache(),
      portrait: emptyCache(),
    };
    // Frames already requested per set, keyed by videoIndex * TOTAL_FRAMES + frameIndex
    const requested: Record<FrameSet, Set<number>> = {
      landscape: new Set(),
      portrait: new Set(),
    };

    let activeScrollTriggers: ReturnType<typeof ScrollTrigger.create>[] = [];
    let activeTweens: gsap.core.Tween[] = [];
    let activeSet = pickFrameSet(window.innerWidth, window.innerHeight);
    let currentVideoIndex = 0;
    let currentFrameIndex = 0;
    let lastDrawnFrame: HTMLImageElement | null = null;
    let hasScrolled = false;
    let isCancelled = false;

    // Idle loader workers park here until the scroll position or frame set changes
    let wakeWorkers: () => void = () => {};
    let wakeSignal = new Promise<void>((resolve) => (wakeWorkers = resolve));
    const notifyWorkers = () => {
      const resolve = wakeWorkers;
      wakeSignal = new Promise<void>((r) => (wakeWorkers = r));
      resolve();
    };

    const isDrawable = (img: HTMLImageElement | null): img is HTMLImageElement =>
      !!img && img.complete && img.naturalWidth > 0;

    // Closest loaded frame of a video within maxDistance, preferring the active set
    const findLoadedFrame = (videoIdx: number, frameIdx: number, maxDistance: number) => {
      const sets: FrameSet[] = activeSet === "landscape" ? ["landscape", "portrait"] : ["portrait", "landscape"];
      for (const set of sets) {
        const frames = framesCache[set][videoIdx];
        for (let d = 0; d <= maxDistance; d++) {
          const before = frames[frameIdx - d];
          if (isDrawable(before)) return before;
          const after = frames[frameIdx + d];
          if (isDrawable(after)) return after;
        }
      }
      return null;
    };

    // Draw frame with fallbacks: nearest loaded frame, then the last painted one
    const drawFrame = (videoIdx: number, frameIdx: number) => {
      const frame =
        findLoadedFrame(videoIdx, frameIdx, 8) ??
        (isDrawable(lastDrawnFrame) ? lastDrawnFrame : findLoadedFrame(videoIdx, 0, TOTAL_FRAMES));
      if (!frame) return;

      const cw = canvas.width;
      const ch = canvas.height;

      // Object-cover scaling of the full 1920×1080 frame. A portrait frame is drawn
      // where its centre slice sits in the full frame, so both sets line up exactly.
      const scale = Math.max(cw / FRAME_W, ch / FRAME_H);
      const sliceScale = FRAME_H / frame.naturalHeight;
      const sliceW = frame.naturalWidth * sliceScale;
      const sx = (cw - FRAME_W * scale) / 2 + ((FRAME_W - sliceW) / 2) * scale;
      const sy = (ch - FRAME_H * scale) / 2;

      ctx.clearRect(0, 0, cw, ch);
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(frame, sx, sy, sliceW * scale, FRAME_H * scale);

      lastDrawnFrame = frame;
    };

    // Size the canvas backing store to device pixels (capped) for sharp frames on Retina screens
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);

      const nextSet = pickFrameSet(window.innerWidth, window.innerHeight);
      if (nextSet !== activeSet) {
        activeSet = nextSet;
        notifyWorkers();
      }
      drawFrame(currentVideoIndex, currentFrameIndex);
    };

    // Image loader: the frame is drawable as soon as it loads
    const loadFrame = (set: FrameSet, vIdx: number, fIdx: number): Promise<void> => {
      requested[set].add(vIdx * TOTAL_FRAMES + fIdx);
      return new Promise((resolve) => {
        const img = new Image();
        img.src = frameUrl(set, vIdx, fIdx);
        img.onload = () => {
          if (!isCancelled) {
            framesCache[set][vIdx][fIdx] = img;
            if (vIdx === currentVideoIndex) drawFrame(currentVideoIndex, currentFrameIndex);
          }

          // Resolve immediately to free the network slot; hidden tabs can hold decode() back
          resolve();

          // Background off-thread decoding so scrubbing paints without a decode stall
          img.decode().catch(() => {
            // Unsupported browsers decode at first paint instead
          });
        };
        img.onerror = () => resolve();
      });
    };

    // Pick the most useful frame still to load. Until the visitor scrolls, only the
    // first video and the next video's skeleton load; after that, everything does,
    // nearest video first and skeleton frames before in-between frames.
    const nextTask = (): { vIdx: number; fIdx: number } | null => {
      let best: { vIdx: number; fIdx: number } | null = null;
      let bestScore = Infinity;
      for (let vIdx = 0; vIdx < VIDEO_COUNT; vIdx++) {
        const vDist = Math.abs(vIdx - currentVideoIndex);
        const isNext = vIdx === currentVideoIndex + 1;
        if (vDist > 0 && !hasScrolled && !isNext) continue;

        for (let fIdx = 0; fIdx < TOTAL_FRAMES; fIdx++) {
          if (requested[activeSet].has(vIdx * TOTAL_FRAMES + fIdx)) continue;
          if (isNext && !hasScrolled && !isSkeleton(fIdx)) continue;

          // Entering a video from above starts at frame 0, from below at the last frame
          const fDist =
            vDist === 0
              ? Math.abs(fIdx - currentFrameIndex)
              : vIdx > currentVideoIndex
                ? fIdx
                : TOTAL_FRAMES - 1 - fIdx;
          const score = vDist * 10000 + (vDist > 0 && !isSkeleton(fIdx) ? 5000 : 0) + fDist;
          if (score < bestScore) {
            bestScore = score;
            best = { vIdx, fIdx };
          }
        }
      }
      return best;
    };

    const runWorker = async () => {
      while (!isCancelled) {
        const task = nextTask();
        if (!task) {
          await wakeSignal;
          continue;
        }
        await loadFrame(activeSet, task.vIdx, task.fIdx);
      }
    };

    const handleFirstScroll = () => {
      if (window.scrollY < window.innerHeight * 0.25) return;
      hasScrolled = true;
      window.removeEventListener("scroll", handleFirstScroll);
      notifyWorkers();
    };

    const setVideoPosition = (videoIdx: number, frameIdx: number) => {
      const videoChanged = videoIdx !== currentVideoIndex;
      currentVideoIndex = videoIdx;
      currentFrameIndex = frameIdx;
      drawFrame(videoIdx, frameIdx);
      if (videoChanged) notifyWorkers();
    };

    const preloadFrames = async () => {
      resizeCanvas();

      // Critical path: the skeleton of video 1 (38 frames) before the loader opens
      const skeleton = Array.from({ length: TOTAL_FRAMES }, (_, i) => i).filter(isSkeleton);
      let loaded = 0;
      const queue = [...skeleton];
      const loadSkeleton = async () => {
        while (!isCancelled && queue.length > 0) {
          await loadFrame(activeSet, 0, queue.shift()!);
          if (!isCancelled) onProgress(Math.round((++loaded / skeleton.length) * 100));
        }
      };
      await Promise.all(Array.from({ length: WORKER_COUNT }, loadSkeleton));

      if (isCancelled) return;

      // Draw initial hero frame instantly
      drawFrame(0, 0);

      // Dismiss loader and unlock UI
      setTimeout(() => {
        if (!isCancelled) {
          onComplete();
        }
      }, 250);

      // Background loading of the remaining frames, in priority order
      window.addEventListener("scroll", handleFirstScroll, { passive: true });
      handleFirstScroll();
      Array.from({ length: WORKER_COUNT }, runWorker);

      // Consecutive ScrollTrigger configurations for all 5 section transitions
      setTimeout(() => {
        if (isCancelled) return;

        const zones = [
          {
            videoIndex: 0,
            start: "top top",
            end: () => {
              const card = document.querySelector("#capability-card-05");
              if (card) {
                const rect = card.getBoundingClientRect();
                return `top+=${rect.top + window.scrollY + rect.height - window.innerHeight} top`;
              }
              return "20% top";
            }
          },
          {
            videoIndex: 1,
            start: () => {
              const card = document.querySelector("#capability-card-05");
              if (card) {
                const rect = card.getBoundingClientRect();
                return `top+=${rect.top + window.scrollY + rect.height - window.innerHeight} top`;
              }
              return "20% top";
            },
            end: () => {
              const section = document.querySelector("#results");
              if (section) {
                const rect = section.getBoundingClientRect();
                return `top+=${rect.top + window.scrollY + rect.height - window.innerHeight} top`;
              }
              return "40% top";
            }
          },
          {
            videoIndex: 2,
            start: () => {
              const section = document.querySelector("#results");
              if (section) {
                const rect = section.getBoundingClientRect();
                return `top+=${rect.top + window.scrollY + rect.height - window.innerHeight} top`;
              }
              return "40% top";
            },
            end: () => {
              const section = document.querySelector("#work");
              if (section) {
                const rect = section.getBoundingClientRect();
                return `top+=${rect.top + window.scrollY + rect.height - window.innerHeight} top`;
              }
              return "60% top";
            }
          },
          {
            videoIndex: 3,
            start: () => {
              const section = document.querySelector("#work");
              if (section) {
                const rect = section.getBoundingClientRect();
                return `top+=${rect.top + window.scrollY + rect.height - window.innerHeight} top`;
              }
              return "60% top";
            },
            end: () => {
              const section = document.querySelector("#studio");
              if (section) {
                const rect = section.getBoundingClientRect();
                return `top+=${rect.top + window.scrollY + rect.height - window.innerHeight} top`;
              }
              return "80% top";
            }
          },
          {
            videoIndex: 4,
            start: () => {
              const section = document.querySelector("#studio");
              if (section) {
                const rect = section.getBoundingClientRect();
                return `top+=${rect.top + window.scrollY + rect.height - window.innerHeight} top`;
              }
              return "80% top";
            },
            end: () => {
              const section = document.querySelector("#contact");
              if (section) {
                const rect = section.getBoundingClientRect();
                // End at the absolute bottom of the page
                return `top+=${rect.top + window.scrollY + rect.height - window.innerHeight} top`;
              }
              return "bottom bottom";
            }
          }
        ];

        zones.forEach((zone) => {
          const frameObj = { frame: 0 };
          const tween = gsap.to(frameObj, {
            frame: TOTAL_FRAMES - 1,
            ease: "none",
            scrollTrigger: {
              trigger: document.body,
              start: zone.start,
              end: zone.end,
              scrub: 1.5,
              onToggle: (self) => {
                if (self.isActive && !isCancelled) {
                  const frameIndex = Math.min(
                    Math.floor(frameObj.frame),
                    TOTAL_FRAMES - 1
                  );
                  setVideoPosition(zone.videoIndex, frameIndex);
                }
              }
            },
            onUpdate: () => {
              if (isCancelled) return;
              const frameIndex = Math.min(
                Math.floor(frameObj.frame),
                TOTAL_FRAMES - 1
              );

              // A trigger is inactive at exactly its start or end, so also follow the
              // first zone at the page top and the last zone at the bottom; otherwise a
              // fast scroll to either end leaves the canvas on a stale frame
              const st = tween.scrollTrigger;
              const active =
                st?.isActive ||
                (zone.videoIndex === 0 && st?.progress === 0) ||
                (zone.videoIndex === VIDEO_COUNT - 1 && st?.progress === 1);

              if (active) {
                setVideoPosition(zone.videoIndex, frameIndex);
              }
            }
          });

          activeTweens.push(tween);
          if (tween.scrollTrigger) {
            activeScrollTriggers.push(tween.scrollTrigger);
          }
        });

        ScrollTrigger.refresh();
      }, 150);
    };

    preloadFrames();

    let resizeFrameId: number | null = null;
    const handleResize = () => {
      if (resizeFrameId) cancelAnimationFrame(resizeFrameId);
      resizeFrameId = requestAnimationFrame(() => {
        if (!isCancelled) {
          resizeCanvas();
        }
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      isCancelled = true;
      notifyWorkers();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleFirstScroll);
      if (resizeFrameId) cancelAnimationFrame(resizeFrameId);

      activeTweens.forEach((t) => t.kill());
      activeScrollTriggers.forEach((st) => st.kill());

      for (const set of Object.values(framesCache)) set.forEach((list) => list.fill(null));
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -100, scale: 1.15 }}
      animate={!isLoading ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -100, scale: 1.15 }}
      transition={{
        type: "spring",
        stiffness: 35,
        damping: 12,
        mass: 1,
        opacity: { duration: 1.2, ease: "easeOut" }
      }}
      className="fixed inset-0 w-full h-full z-0 overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </motion.div>
  );
}
