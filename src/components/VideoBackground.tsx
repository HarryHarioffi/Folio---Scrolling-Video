/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Scroll-driven video background using canvas frame rendering.
 * Preloads PNG frame sequence and maps scroll position to frame index
 * via GSAP ScrollTrigger.
 */

import { motion } from "motion/react";
import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 150;

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

    const framesList: (HTMLImageElement | null)[] = Array(TOTAL_FRAMES).fill(null);
    let st: ReturnType<typeof ScrollTrigger.create> | null = null;
    let currentFrameIndex = 0;
    let isCancelled = false;

    // Resize canvas to viewport
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (framesList.length > 0) {
        drawFrame(framesList, canvas, ctx, currentFrameIndex);
      }
    };

    // Closest loaded-frame fallback draw function
    const drawFrame = (
      frms: (HTMLImageElement | null)[],
      cvs: HTMLCanvasElement,
      context: CanvasRenderingContext2D,
      index: number
    ) => {
      let frame = frms[index];

      // Fallback search: find the closest loaded frame in the cache
      if (!frame || !frame.complete || frame.naturalWidth === 0) {
        let closestIndex = -1;
        let minDistance = Infinity;

        for (let i = 0; i < frms.length; i++) {
          const f = frms[i];
          if (f && f.complete && f.naturalWidth > 0) {
            const dist = Math.abs(i - index);
            if (dist < minDistance) {
              minDistance = dist;
              closestIndex = i;
            }
          }
        }

        if (closestIndex !== -1) {
          frame = frms[closestIndex];
        }
      }

      if (!frame) return;

      const cw = cvs.width;
      const ch = cvs.height;
      const fw = frame.naturalWidth;
      const fh = frame.naturalHeight;

      if (fw === 0 || fh === 0) return;

      // Object-cover scaling
      const scale = Math.max(cw / fw, ch / fh);
      const sw = fw * scale;
      const sh = fh * scale;
      const sx = (cw - sw) / 2;
      const sy = (ch - sh) / 2;

      context.clearRect(0, 0, cw, ch);
      context.drawImage(frame, sx, sy, sw, sh);
    };

    // Parallel preloading function
    const preloadFrames = async () => {
      resizeCanvas();

      // Core image loader with native off-thread GPU decoding
      const loadFrame = (index: number): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          const frameNumber = String(index + 1).padStart(3, "0");
          img.src = `/frames/frame_${frameNumber}.png`;

          img.onload = async () => {
            try {
              // Decodes off the main thread before drawing
              await img.decode();
              if (!isCancelled) {
                framesList[index] = img;
              }
              resolve(img);
            } catch (err) {
              // Still resolve the image on decode failure so it can paint normally
              if (!isCancelled) {
                framesList[index] = img;
              }
              resolve(img);
            }
          };

          img.onerror = (err) => {
            console.error(`Failed to load frame ${frameNumber}:`, err);
            reject(err);
          };
        });
      };

      // TIER 1: Critical path (Frames 1-3)
      const tier1Indices = [0, 1, 2];
      let tier1Loaded = 0;

      const tier1Promises = tier1Indices.map(async (idx) => {
        try {
          await loadFrame(idx);
        } catch (e) {
          console.warn(`Critical frame ${idx + 1} failed to load, continuing...`);
        } finally {
          if (!isCancelled) {
            tier1Loaded++;
            onProgress(Math.round((tier1Loaded / tier1Indices.length) * 100));
          }
        }
      });

      // Wait for critical frames to download and decode
      await Promise.all(tier1Promises);

      if (isCancelled) return;

      // Paint the initial hero frame instantly
      drawFrame(framesList, canvas, ctx, 0);

      // Unlock the UI and dismiss the loader instantly
      setTimeout(() => {
        if (!isCancelled) {
          onComplete();
        }
      }, 250);

      // TIER 2: Playable Core Path (Load every 3rd frame to establish playable sequence)
      const tier2Indices: number[] = [];
      for (let i = 5; i < TOTAL_FRAMES; i += 3) {
        tier2Indices.push(i);
      }

      // TIER 3: High-Fidelity Path (Load remaining intermediate frames)
      const tier3Indices: number[] = [];
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        if (!tier1Indices.includes(i) && !tier2Indices.includes(i)) {
          tier3Indices.push(i);
        }
      }

      // Throttled background loader helper
      const loadBatchInBackground = async (indices: number[], batchSize: number, delayMs: number) => {
        for (let i = 0; i < indices.length; i += batchSize) {
          if (isCancelled) break;

          const batch = indices.slice(i, i + batchSize);
          await Promise.all(
            batch.map(async (idx) => {
              try {
                await loadFrame(idx);
              } catch (e) {
                // Silently swallow load errors for background frames
              }
            })
          );

          // Perform a micro-redraw if the user is currently at a scroll index that just finished loading
          if (canvasRef.current) {
            drawFrame(framesList, canvasRef.current, ctx, currentFrameIndex);
          }

          // Yield main-thread execution
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      };

      // Stagger background load paths
      loadBatchInBackground(tier2Indices, 4, 35).then(() => {
        if (isCancelled) return;
        loadBatchInBackground(tier3Indices, 3, 75);
      });

      // Setup ScrollTrigger mapped scroll to frame index
      setTimeout(() => {
        if (isCancelled) return;
        const fifthCard = document.querySelector("#capability-card-05");
        st = ScrollTrigger.create({
          trigger: document.body,
          start: "top top",
          end: () => {
            if (fifthCard) {
              const rect = fifthCard.getBoundingClientRect();
              const absoluteBottom = rect.top + window.scrollY + rect.height;
              return `top+=${absoluteBottom} top`;
            }
            return "40% top";
          },
          scrub: 1.5,
          onUpdate: (self) => {
            if (isCancelled) return;
            const frameIndex = Math.min(
              Math.floor(self.progress * (TOTAL_FRAMES - 1)),
              TOTAL_FRAMES - 1
            );
            if (frameIndex !== currentFrameIndex) {
              currentFrameIndex = frameIndex;
              drawFrame(framesList, canvas, ctx, frameIndex);
            }
          },
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
      window.removeEventListener("resize", handleResize);
      if (resizeFrameId) cancelAnimationFrame(resizeFrameId);
      st?.kill();
      framesList.fill(null);
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
