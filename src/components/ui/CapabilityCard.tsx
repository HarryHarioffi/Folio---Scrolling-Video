/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

interface CapabilityCardProps {
  key?: string | number;
  index: string;
  title: string;
  tags: string;
  isFull?: boolean;
  badges?: string[];
}

export default function CapabilityCard({ index, title, tags, isFull, badges }: CapabilityCardProps) {
  return (
    <motion.div
      id={`capability-card-${index}`}
      data-video-readable=""
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay: parseInt(index) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={`video-readable video-readable-panel video-readable-border bg-bg-surface/15 hover:bg-bg-surface/40 border p-6 rounded-[2px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(26,21,19,0.035)] hover:border-accent-primary group flex flex-col ${isFull ? "sm:col-span-2" : "col-span-1"}`}
    >
      <div className="flex justify-between items-center w-full">
        <div className="video-readable-accent font-mono text-[11px] font-semibold">{index}</div>
        <ArrowUpRight className="w-4 h-4 text-accent-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-0.5 group-hover:translate-y-0 -translate-x-0.5 group-hover:translate-x-0" />
      </div>
      <div className="flex flex-col flex-1 mt-6">
        <h3 className="video-readable-primary font-sans text-lg font-medium mb-3 transition-colors group-hover:text-accent-primary duration-300">{title}</h3>
        <div className="video-readable-secondary font-mono text-[10px] leading-relaxed">
          {tags}
        </div>
      </div>
      {isFull && badges && badges.length > 0 && (
        <div className="hidden md:flex items-center gap-3 mt-6">
          {badges.map((badge, idx) => (
            <div key={idx} className="video-readable-border video-readable-secondary font-mono text-[10px] border px-2.5 py-1 rounded-[2px] uppercase tracking-wide">
              [{badge}]
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
