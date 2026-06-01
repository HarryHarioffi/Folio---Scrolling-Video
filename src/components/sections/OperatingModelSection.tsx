import { motion } from "motion/react";
import SectionHeader from "../SectionHeader";
import { 
  OPERATING_MODEL_PILLARS, 
  CREDIBILITY_TITLE, 
  CREDIBILITY_SUBTITLE, 
  HOW_WE_WORK 
} from "../../data/content";
import { useParallax } from "../../hooks/useParallax";

export default function OperatingModelSection() {
  const pillarsRef = useParallax<HTMLDivElement>({ distance: 25, speed: 0.5 });

  return (
    <section id="results" className="video-blend-stage px-5 sm:px-8 md:px-12 py-24 md:py-40 z-10 relative">
      <SectionHeader label="// RESULTS" title={CREDIBILITY_TITLE} adaptiveText />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
        {/* Left column — Content */}
        <div className="md:col-span-7 flex flex-col">
          <div data-video-readable="" className="video-readable border-l-2 border-accent-primary pl-6 mb-12">
            <p className="video-readable-secondary font-sans text-[clamp(1.1rem,2vw,1.45rem)] font-light leading-relaxed">
              {CREDIBILITY_SUBTITLE}
            </p>
          </div>

          {/* Operating Principles Header */}
          <div data-video-readable="" className="video-readable video-readable-muted font-mono text-[10px] uppercase tracking-widest mb-6 border-b border-border-custom pb-2">
            Operating Principles:
          </div>

          {/* Operating Principles Cards */}
          <div ref={pillarsRef} className="flex flex-col gap-4">
            {OPERATING_MODEL_PILLARS.map((item, i) => (
              <motion.div
                data-video-readable=""
                key={i}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.55 }}
                className="video-readable video-readable-panel video-readable-border bg-bg-surface border border-border-custom p-6 rounded-[2px] hover:border-accent-primary transition-colors"
              >
                <h3 className="video-readable-primary font-sans text-base font-semibold mb-3">{item.title}</h3>
                <p className="video-readable-secondary font-sans text-[13px] leading-relaxed">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right column — empty space for video */}
        <div className="hidden md:block md:col-span-5" />
      </div>
    </section>
  );
}
