/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MARQUEE_ITEMS } from "../data/content";

export default function Marquee() {
  return (
    <div className="relative w-full h-14 border-t border-b border-border-custom overflow-hidden bg-bg-void flex items-center z-10">
      <div className="flex whitespace-nowrap animate-marquee">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-12 px-6">
            {MARQUEE_ITEMS.map((item, j) => (
              <span key={j} className="font-mono text-[12px] text-text-muted uppercase tracking-[0.12em] flex items-center gap-12">
                {item}
                <span className="text-text-muted/40">·</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
