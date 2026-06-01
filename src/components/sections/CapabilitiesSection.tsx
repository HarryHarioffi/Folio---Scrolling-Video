import SectionHeader from "../SectionHeader";
import CapabilityCard from "../ui/CapabilityCard";
import { CAPABILITIES, CAPABILITIES_TITLE, CAPABILITIES_SUBTITLE, ENGAGEMENT_TYPES } from "../../data/content";
import { useParallax } from "../../hooks/useParallax";

export default function CapabilitiesSection() {
  const cardsRef = useParallax<HTMLDivElement>({ distance: 30, speed: 0.6 });

  return (
    <section id="services" className="video-blend-stage px-5 sm:px-8 md:px-12 py-24 md:py-40 z-10 relative">
      <SectionHeader label="// SERVICES" title={CAPABILITIES_TITLE} adaptiveText />

      {/* Grid container */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
        {/* Left column — empty space for video */}
        <div className="hidden md:block md:col-span-5" />

        {/* Right column — Content */}
        <div className="md:col-span-7 flex flex-col">
          <p data-video-readable="" className="video-readable video-readable-secondary font-sans text-[clamp(1.1rem,2vw,1.45rem)] font-light leading-relaxed mb-8">
            {CAPABILITIES_SUBTITLE}
          </p>

          <div data-video-readable="" className="video-readable flex flex-col gap-3 border-l-2 border-accent-primary pl-6 mb-12">
            <div className="video-readable-muted font-mono text-[10px] uppercase tracking-widest mb-2">Common Engagement Types:</div>
            {ENGAGEMENT_TYPES.map((type, i) => (
              <div key={i} className="video-readable-secondary font-mono text-[12px] leading-relaxed">
                — {type}
              </div>
            ))}
          </div>

          {/* Card grid with parallax */}
          <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CAPABILITIES.map(({ index, title, tags, isFull, badges }) => (
              <CapabilityCard
                key={index}
                index={index}
                title={title}
                tags={tags}
                isFull={isFull}
                badges={badges}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
