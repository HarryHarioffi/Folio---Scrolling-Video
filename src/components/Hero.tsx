import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useRef, useState } from "react";
import { HERO_WORDS, HERO_SUBTITLE, HERO_RIGHT_TAGLINE } from "../data/content";
import InteractiveBadge from "./ui/InteractiveBadge";

interface HeroProps {
  isLoading: boolean;
}

export default function Hero({ isLoading }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMouseOver, setIsMouseOver] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    container.style.setProperty("--mouse-x", `${x}px`);
    container.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
      className="relative min-h-screen z-10 flex flex-col justify-between px-5 sm:px-8 md:px-12 pt-24 md:pt-28 pb-8 md:pb-12 overflow-hidden"
    >
      {/* Subtle blueprint grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-80 pointer-events-none z-0" />

      {/* Interactive mouse radial spotlight glow */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500"
        style={{
          opacity: isMouseOver ? 1 : 0,
          background: `radial-gradient(350px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(162, 59, 18, 0.055), transparent 80%)`
        }}
      />

      {/* Bottom section spacing */}
      <div className="flex-1 z-10" />

      <div className="flex items-end justify-between gap-8 z-10">
        {/* Left column: description, CTAs */}
        <div className="flex flex-col gap-6 md:gap-8 max-w-[55%]">
          {/* Draggable Glassmorphic Badge directly above "WE SHAPE" */}
          <div className="w-fit mb-2 md:mb-3 select-none pointer-events-auto z-20">
            <InteractiveBadge />
          </div>

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

      {/* Pulse scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={isLoading ? { opacity: 0 } : { opacity: 0.5 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-10 select-none cursor-pointer group/scroll"
        onClick={() => {
          const nextSection = document.querySelector("#services");
          if (nextSection) {
            nextSection.scrollIntoView({ behavior: "smooth" });
          }
        }}
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted group-hover/scroll:text-accent-primary transition-colors">
          SCROLL
        </span>
        <div className="w-[1px] h-8 bg-border-custom relative overflow-hidden">
          <motion.div 
            animate={{ y: ["-100%", "100%"] }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.8, 
              ease: "easeInOut" 
            }}
            className="absolute left-0 top-0 bottom-0 w-full bg-accent-primary"
          />
        </div>
      </motion.div>
    </section>
  );
}
