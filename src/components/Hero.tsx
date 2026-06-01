import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { HERO_WORDS, HERO_SUBTITLE, HERO_RIGHT_TAGLINE } from "../data/content";

interface HeroProps {
  isLoading: boolean;
}

export default function Hero({ isLoading }: HeroProps) {
  return (
    <section className="relative min-h-screen z-10 flex flex-col justify-between px-5 sm:px-8 md:px-12 pt-24 md:pt-28 pb-8 md:pb-12 overflow-hidden">
      {/* Bottom section */}
      <div className="flex-1" />

      <div className="flex items-end justify-between gap-8">
        {/* Left column: description, CTAs */}
        <div className="flex flex-col gap-8 md:gap-10 max-w-[55%]">
          <div className="flex flex-wrap gap-x-3 sm:gap-x-4 md:gap-x-5 gap-y-0 sm:gap-y-2">
            {HERO_WORDS.map((wordObj, i) => (
              <div key={i} className="overflow-hidden">
                <motion.div
                  initial={{ y: "110%" }}
                  animate={isLoading ? { y: "110%" } : { y: 0 }}
                  transition={{ delay: 0.5 + i * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className={`font-display text-[clamp(2.8rem,6.5vw,7.5rem)] leading-[0.88] folio-text-shadow uppercase ${wordObj.highlight ? "text-accent-primary" : "text-text-primary"}`}
                >
                  {wordObj.text}
                </motion.div>
              </div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={isLoading ? { opacity: 0, y: 32 } : { opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="font-sans text-[9px] sm:text-xs md:text-sm font-normal text-text-secondary uppercase tracking-[0.06em] max-w-[280px] md:max-w-sm folio-text-shadow"
          >
            {HERO_SUBTITLE}
          </motion.div>

          <div className="flex flex-wrap gap-6 sm:gap-8">
            <motion.a
              href="#contact"
              initial={{ opacity: 0, y: 32 }}
              animate={isLoading ? { opacity: 0, y: 32 } : { opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-2 font-sans text-lg sm:text-2xl md:text-3xl font-medium text-accent-primary hover:text-text-primary transition-colors group whitespace-nowrap w-fit folio-text-shadow"
            >
              Start a Project
              <ArrowUpRight className="w-5 sm:w-6 md:w-7 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </motion.a>
            <motion.a
              href="#work"
              initial={{ opacity: 0, y: 32 }}
              animate={isLoading ? { opacity: 0, y: 32 } : { opacity: 1, y: 0 }}
              transition={{ delay: 0.48, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-2 font-sans text-lg sm:text-2xl md:text-3xl font-medium text-text-secondary hover:text-text-primary transition-colors group whitespace-nowrap w-fit folio-text-shadow"
            >
              View Our Work
              <ArrowUpRight className="w-5 sm:w-6 md:w-7 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </motion.a>
          </div>
        </div>

        {/* Right-bottom: tagline */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isLoading ? { opacity: 0, y: 32 } : { opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="hidden md:block font-mono text-[10px] sm:text-xs md:text-sm text-text-secondary uppercase tracking-[0.1em] folio-text-shadow text-right leading-relaxed"
        >
          {HERO_RIGHT_TAGLINE.split(" / ").map((line, idx) => (
            <span key={idx}>
              {line}
              {idx < HERO_RIGHT_TAGLINE.split(" / ").length - 1 && <br />}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
