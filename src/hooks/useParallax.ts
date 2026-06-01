/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Reusable parallax scroll hook.
 * Returns a ref to attach to the target element.
 * Uses GSAP ScrollTrigger to apply a subtle vertical shift
 * relative to scroll position.
 */

import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ParallaxOptions {
  /** Vertical offset range in pixels (default: 60) */
  distance?: number;
  /** Speed multiplier — higher = more parallax effect (default: 1) */
  speed?: number;
  /** Whether to apply the effect (allows conditional usage) */
  enabled?: boolean;
}

/**
 * Applies a subtle parallax translate-Y to the referenced element
 * based on scroll position within its viewport intersection.
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>(
  options: ParallaxOptions = {}
) {
  const { distance = 60, speed = 1, enabled = true } = options;
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    if (!enabled || !ref.current) return;

    const el = ref.current;
    const yDistance = distance * speed;

    // Hint browser to promote to hardware-accelerated layer for smooth scrolling
    el.style.willChange = "transform";

    const anim = gsap.fromTo(
      el,
      { y: yDistance },
      {
        y: -yDistance,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
        },
      }
    );

    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
      el.style.willChange = "";
    };
  }, [distance, speed, enabled]);

  return ref;
}
