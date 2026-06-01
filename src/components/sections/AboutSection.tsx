import SectionHeader from "../SectionHeader";
import { 
  ABOUT_TAGS, 
  ABOUT_TITLE, 
  ABOUT_LEDE, 
  ABOUT_PARAGRAPHS, 
  ABOUT_WE_BUILD_DESC 
} from "../../data/content";
import { useParallax } from "../../hooks/useParallax";

export default function AboutSection() {
  const buildRef = useParallax<HTMLDivElement>({ distance: 35, speed: 0.5 });

  return (
    <section id="studio" className="video-blend-stage px-5 sm:px-8 md:px-12 py-24 md:py-40 z-10 relative">
      <SectionHeader label="// STUDIO" title={ABOUT_TITLE} adaptiveText />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
        {/* Left column — Content */}
        <div className="md:col-span-7 flex flex-col">
          <div data-video-readable="" className="video-readable border-l-2 border-accent-primary pl-6 mb-8">
            <p className="video-readable-primary font-sans text-[clamp(1.1rem,2.5vw,1.75rem)] font-light leading-tight">
              {ABOUT_LEDE}
            </p>
          </div>

          <div data-video-readable="" className="video-readable video-readable-secondary flex flex-col gap-6 text-[15px] font-normal leading-relaxed max-w-xl mb-12">
            {ABOUT_PARAGRAPHS.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          {/* We Build Too Row */}
          <div ref={buildRef} data-video-readable="" className="video-readable video-readable-border pt-10 border-t">
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="video-readable-display video-readable-primary font-display text-[clamp(2rem,5vw,4rem)] uppercase leading-none mb-4">
                  We build too.
                </h3>
                <p className="video-readable-secondary font-sans text-[14px] leading-relaxed">
                  {ABOUT_WE_BUILD_DESC}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {ABOUT_TAGS.map((tag) => (
                  <span key={tag} className="video-readable-border video-readable-primary font-mono text-[11px] border px-3 py-2 rounded-[2px] uppercase tracking-wide">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right column — empty space for video */}
        <div className="hidden md:block md:col-span-5" />
      </div>
    </section>
  );
}
