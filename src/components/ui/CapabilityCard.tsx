/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";

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
      className={`video-readable video-readable-panel video-readable-border bg-transparent border p-6 rounded-[2px] transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-primary group flex flex-col ${isFull ? "sm:col-span-2" : "col-span-1"}`}
    >
      <div className="video-readable-accent font-mono text-[11px]">{index}</div>
      <div className="flex flex-col flex-1 mt-6">
        <h3 className="video-readable-primary font-sans text-lg font-medium mb-3">{title}</h3>
        <div className="video-readable-secondary font-mono text-[10px] leading-relaxed">
          {tags}
        </div>
      </div>
      {isFull && badges && badges.length > 0 && (
        <div className="hidden md:flex items-center gap-3 mt-6">
          {badges.map((badge, idx) => (
            <div key={idx} className="video-readable-border video-readable-secondary font-mono text-[10px] border px-2 py-1 rounded-[2px] uppercase">
              [{badge}]
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
