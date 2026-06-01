import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { 
  CONTACT_EMAIL, 
  CONTACT_TITLE, 
  CONTACT_DESCRIPTION 
} from "../../data/content";
import { useParallax } from "../../hooks/useParallax";

export default function ContactSection() {
  const footerRef = useParallax<HTMLElement>({ distance: 15, speed: 0.3 });

  return (
    <section id="contact" className="video-blend-stage py-24 md:py-40 pb-12 md:pb-16 z-10 relative">
      {/* Content wrapper with standard page margins */}
      <div className="px-5 sm:px-8 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="w-full"
        >
          <h2 data-video-readable="" className="video-readable video-readable-display video-readable-primary font-display text-[clamp(2.5rem,5.5vw,5.5rem)] leading-[0.88] mb-12 uppercase max-w-4xl">
            {CONTACT_TITLE}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          {/* Left column — empty space for video */}
          <div className="hidden md:block md:col-span-5" />

          {/* Right column — Content */}
          <div className="md:col-span-7 flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <p data-video-readable="" className="video-readable video-readable-secondary font-sans text-[clamp(1.1rem,2vw,1.45rem)] font-light leading-relaxed max-w-2xl mb-12">
                {CONTACT_DESCRIPTION}
              </p>

              <div className="flex flex-wrap gap-4 mt-12">
                <a href={`mailto:${CONTACT_EMAIL}?subject=Start a Project`} className="bg-accent-primary text-white font-sans font-medium px-8 py-4 rounded-[2px] hover:brightness-110 transition-all duration-200 flex items-center gap-2 group cursor-pointer">
                  Start a Project <ArrowUpRight className="w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
                <a href={`mailto:${CONTACT_EMAIL}?subject=Share a Brief`} className="border border-border-custom text-text-primary bg-transparent font-sans font-medium px-8 py-4 rounded-[2px] hover:border-accent-primary transition-all duration-200 flex items-center gap-2 group cursor-pointer">
                  Share a Brief <ArrowUpRight className="w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
              </div>

              <div className="mt-12">
                <a href={`mailto:${CONTACT_EMAIL}`} className="font-mono text-[14px] text-text-muted hover:text-text-primary transition-colors">
                  {CONTACT_EMAIL}
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer outside the padded container to allow the border-t to span full-width */}
      <footer 
        ref={footerRef} 
        data-video-readable="" 
        className="video-readable border-t border-border-custom mt-24 pt-12 px-5 sm:px-8 md:px-12 flex justify-between items-center w-full"
      >
        <div className="text-left font-mono text-[12px] text-text-muted uppercase tracking-tight">
          © {new Date().getFullYear()} FOLIO
        </div>
        <div className="text-right font-mono text-[12px] text-text-muted uppercase tracking-tight">
          folio.co
        </div>
      </footer>
    </section>
  );
}
