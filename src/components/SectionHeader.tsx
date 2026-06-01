/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";

interface SectionHeaderProps {
  label: string;
  title: string;
  id?: string;
  adaptiveText?: boolean;
}

export default function SectionHeader({ label, title, id, adaptiveText }: SectionHeaderProps) {
  const cPrimary = adaptiveText ? "video-readable-primary" : "text-text-primary";
  const cAccent = adaptiveText ? "video-readable-accent" : "text-accent-primary";

  return (
    <motion.div
      data-video-readable=""
      id={id}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="video-readable max-w-4xl mb-24 md:mb-32"
    >
      <div className={`video-readable-accent font-mono text-[11px] uppercase tracking-[0.14em] mb-4 ${cAccent}`}>
        {label}
      </div>
      <h2 className={`video-readable-display video-readable-primary font-sans text-[clamp(2rem,5vw,4rem)] font-light leading-tight ${cPrimary}`}>
        {title}
      </h2>
    </motion.div>
  );
}
