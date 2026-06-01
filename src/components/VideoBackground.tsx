/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Multi-video scroll-driven background using canvas frame rendering.
 * Preloads 5 PNG frame sequences in a staged background pipeline
 * and maps scrolling zones to video indices and frame indices.
 */

import { motion } from "motion/react";
import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 150;
const VIDEO_COUNT = 5;

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

    // 2D Array Cache: framesCache[videoIndex][frameIndex]
    const framesCache: (HTMLImageElement | null)[][] = Array.from(
      { length: VIDEO_COUNT },
      () => Array(TOTAL_FRAMES).fill(null)
    );

    let activeScrollTriggers: ReturnType<typeof ScrollTrigger.create>[] = [];
    let activeTweens: gsap.core.Tween[] = [];
    let currentVideoIndex = 0;
    let currentFrameIndex = 0;
    let lastDrawnVideoIndex = 0;
    let lastDrawnFrameIndex = 0;
    let isCancelled = false;

    // Resize canvas to viewport and paint current frame
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawFrame(framesCache, canvas, ctx, currentVideoIndex, currentFrameIndex);
    };

    // Draw frame function with robust fallback checks
    const drawFrame = (
      frms: (HTMLImageElement | null)[][],
      cvs: HTMLCanvasElement,
      context: CanvasRenderingContext2D,
      videoIdx: number,
      frameIdx: number
    ) => {
      let frame = frms[videoIdx][frameIdx];
      let drawVideoIndex = videoIdx;
      let drawFrameIndex = frameIdx;

      // Fallback search: find the closest loaded frame in the current video sequence
      if (!frame || !frame.complete || frame.naturalWidth === 0) {
        let closestIndex = -1;
        let minDistance = Infinity;

        for (let i = 0; i < TOTAL_FRAMES; i++) {
          const f = frms[videoIdx][i];
          if (f && f.complete && f.naturalWidth > 0) {
            const dist = Math.abs(i - frameIdx);
            if (dist < minDistance) {
              minDistance = dist;
              closestIndex = i;
            }
          }
        }

        if (closestIndex !== -1 && minDistance <= 8) {
          frame = frms[videoIdx][closestIndex];
          drawVideoIndex = videoIdx;
          drawFrameIndex = closestIndex;
        } else {
          // If no frame is found, hold on the last successfully painted frame
          const lastFrame = frms[lastDrawnVideoIndex][lastDrawnFrameIndex];
          if (lastFrame && lastFrame.complete && lastFrame.naturalWidth > 0) {
            frame = lastFrame;
            drawVideoIndex = lastDrawnVideoIndex;
            drawFrameIndex = lastDrawnFrameIndex;
          } else if (frms[videoIdx][0] && frms[videoIdx][0]!.complete && frms[videoIdx][0]!.naturalWidth > 0) {
            // Absolute fallback: first frame of requested video
            frame = frms[videoIdx][0];
            drawVideoIndex = videoIdx;
            drawFrameIndex = 0;
          } else {
            return;
          }
        }
      }

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

      // Cache painted coordinates for fallback tracking
      lastDrawnVideoIndex = drawVideoIndex;
      lastDrawnFrameIndex = drawFrameIndex;
    };

    // Staged asynchronous frame preloading pipeline
    const preloadFrames = async () => {
      resizeCanvas();

      // Image loader with off-thread GPU decoding
      const loadFrame = (vIdx: number, fIdx: number): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          const frameNumber = String(fIdx + 1).padStart(3, "0");
          img.src = `/frames/video${vIdx + 1}/frame_${frameNumber}.png`;

          img.onload = async () => {
            try {
              await img.decode();
              if (!isCancelled) {
                framesCache[vIdx][fIdx] = img;
              }
              resolve(img);
            } catch (err) {
              if (!isCancelled) {
                framesCache[vIdx][fIdx] = img;
              }
              resolve(img);
            }
          };

          img.onerror = (err) => {
            reject(err);
          };
        });
      };

      // TIER 1 (Critical Path): Load all 150 frames of Video 1 (First to second section transition)
      let tier1Loaded = 0;

      const tier1Promises = Array.from({ length: TOTAL_FRAMES }, (_, i) => i).map(async (fIdx) => {
        try {
          await loadFrame(0, fIdx);
        } catch (e) {
          // Swallow load error
        } finally {
          if (!isCancelled) {
            tier1Loaded++;
            onProgress(Math.round((tier1Loaded / TOTAL_FRAMES) * 100));
          }
        }
      });

      await Promise.all(tier1Promises);

      if (isCancelled) return;

      // Draw initial hero frame instantly
      drawFrame(framesCache, canvas, ctx, 0, 0);

      // Dismiss loader and unlock UI
      setTimeout(() => {
        if (!isCancelled) {
          onComplete();
        }
      }, 250);

      // TIER 2: Sequentially background-load Videos 2, 3, 4, and 5
      const loadRemainingVideos = async () => {
        for (let v = 1; v < VIDEO_COUNT; v++) {
          if (isCancelled) break;

          const tier2Indices: number[] = [];
          for (let i = 0; i < TOTAL_FRAMES; i += 3) {
            tier2Indices.push(i);
          }
          const tier3Indices: number[] = [];
          for (let i = 0; i < TOTAL_FRAMES; i++) {
            if (!tier2Indices.includes(i)) {
              tier3Indices.push(i);
            }
          }

          const loadBatch = async (indices: number[], batchSize: number, delayMs: number) => {
            for (let i = 0; i < indices.length; i += batchSize) {
              if (isCancelled) break;
              const batch = indices.slice(i, i + batchSize);
              await Promise.all(
                batch.map(async (fIdx) => {
                  try {
                    await loadFrame(v, fIdx);
                  } catch (e) {
                    // Silence error
                  }
                })
              );

              // Live-redraw active frame if user is scrolled in this video's zone
              if (canvasRef.current && currentVideoIndex === v) {
                drawFrame(framesCache, canvasRef.current, ctx, currentVideoIndex, currentFrameIndex);
              }
              
              await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
          };

          // Playable skeleton (every 3rd frame)
          await loadBatch(tier2Indices, 4, 35);
          if (isCancelled) break;
          // High fidelity in-between frames
          await loadBatch(tier3Indices, 3, 70);
        }
      };

      loadRemainingVideos();

      // 4. Consecutive ScrollTrigger configurations for all 5 section transitions
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
                  currentVideoIndex = zone.videoIndex;
                  const frameIndex = Math.min(
                    Math.floor(frameObj.frame),
                    TOTAL_FRAMES - 1
                  );
                  currentFrameIndex = frameIndex;
                  drawFrame(framesCache, canvas, ctx, zone.videoIndex, frameIndex);
                }
              }
            },
            onUpdate: () => {
              if (isCancelled) return;
              const frameIndex = Math.min(
                Math.floor(frameObj.frame),
                TOTAL_FRAMES - 1
              );
              
              const active = tween.scrollTrigger?.isActive;
              
              if (active) {
                currentVideoIndex = zone.videoIndex;
                currentFrameIndex = frameIndex;
                drawFrame(framesCache, canvas, ctx, zone.videoIndex, frameIndex);
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
      window.removeEventListener("resize", handleResize);
      if (resizeFrameId) cancelAnimationFrame(resizeFrameId);
      
      activeTweens.forEach((t) => t.kill());
      activeScrollTriggers.forEach((st) => st.kill());
      
      framesCache.forEach((list) => list.fill(null));
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
