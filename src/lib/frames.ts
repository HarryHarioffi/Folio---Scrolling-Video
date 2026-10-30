/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Scroll-video frame sets, shared by VideoBackground and the page head.
 * Geometry must match scripts/build-frames.mjs.
 */

// Bump together with `npm run frames -- <version>` so cached frames are replaced
export const FRAMES_VERSION = "v2";
export const TOTAL_FRAMES = 150;
export const VIDEO_COUNT = 5;

// Portrait frames are the 810×1080 centre slice of the full 1920×1080 frame
export const FRAME_W = 1920;
export const FRAME_H = 1080;
export const PORTRAIT_W = 810;

export type FrameSet = "landscape" | "portrait";

// A canvas covering a screen no wider than 3:4 only ever shows the centre
// 810 px of a frame, so those screens load the smaller portrait set.
export const pickFrameSet = (width: number, height: number): FrameSet =>
  width / height <= PORTRAIT_W / FRAME_H ? "portrait" : "landscape";

// The same rule as a media query, for preloading the first frame from the HTML
export const PORTRAIT_MEDIA = `(max-aspect-ratio: ${PORTRAIT_W}/${FRAME_H})`;
export const LANDSCAPE_MEDIA = `not all and ${PORTRAIT_MEDIA}`;

export const frameUrl = (set: FrameSet, vIdx: number, fIdx: number) =>
  `/frames/${FRAMES_VERSION}/${set}/video${vIdx + 1}/${String(fIdx + 1).padStart(3, "0")}.webp`;
