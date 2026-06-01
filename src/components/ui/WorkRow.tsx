/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";

interface WorkRowProps {
  key?: string | number;
  index: string;
  category: string;
  title: string;
  impact: string;
  deliverables: string[];
  isExpanded: boolean;
  onToggle: () => void;
}

export default function WorkRow({ index, category, title, impact, deliverables, isExpanded, onToggle }: WorkRowProps) {
  return (
    <div data-video-readable="" className="video-readable video-readable-border border-t w-full group">
      <button
        onClick={onToggle}
        className="w-full flex items-center text-left py-5 sm:py-6 gap-4 sm:gap-8 md:gap-12 cursor-pointer"
      >
        <span className="video-readable-accent font-mono text-[11px] w-6 shrink-0">{index}</span>
        <span className="video-readable-muted font-mono text-[11px] uppercase tracking-[0.1em] hidden sm:block w-40 shrink-0">{category}</span>
        <span className="video-readable-primary font-sans text-lg sm:text-xl font-normal flex-1">{title}</span>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
          <ChevronDown className="video-readable-muted group-hover:text-text-primary transition-colors" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-10 pt-2 flex flex-col md:flex-row gap-8 md:gap-16 pl-[2rem] sm:pl-[6rem] md:pl-[8rem]">
              <div className="md:w-1/3 flex flex-col gap-2">
                <div className="video-readable-muted font-mono text-[10px] uppercase mb-2 tracking-widest">Delivered:</div>
                {deliverables.map((d, i) => (
                  <div key={i} className="video-readable-secondary font-mono text-[12px] flex items-start gap-2 leading-relaxed">
                    <span className="video-readable-accent">—</span> {d}
                  </div>
                ))}
              </div>
              <div className="md:w-2/3 border-l-2 border-accent-primary pl-6 max-w-xl">
                <div className="video-readable-muted font-mono text-[10px] uppercase mb-4 tracking-widest">The Impact:</div>
                <p className="video-readable-primary font-sans text-[15px] italic leading-relaxed">
                  "{impact}"
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
