/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * App.tsx — Root layout shell for The Cloud Company website.
 * Manages loading state, scroll lock, and section composition.
 */

import { useEffect, useState } from "react";
import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import Loader from "./components/Loader";
import Navbar from "./components/Navbar";
import MobileMenu from "./components/MobileMenu";
import VideoBackground from "./components/VideoBackground";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import CapabilitiesSection from "./components/sections/CapabilitiesSection";
import OperatingModelSection from "./components/sections/OperatingModelSection";
import WorkSection from "./components/sections/WorkSection";
import AboutSection from "./components/sections/AboutSection";
import ContactSection from "./components/sections/ContactSection";
import CustomCursor from "./components/ui/CustomCursor";

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Lock scrolling while loading or when the menu is open
  useEffect(() => {
    const shouldLock = isLoading || isMenuOpen;
    document.documentElement.style.overflow = shouldLock ? "hidden" : "";
    document.body.style.overflow = shouldLock ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isLoading, isMenuOpen]);

  return (
    <ReactLenis root>
      <div className="min-h-screen bg-bg-void antialiased">
        {/* Global high-tech target reticle custom cursor */}
        <CustomCursor />

        {/* Loader overlay */}
        <Loader progress={loadProgress} isComplete={!isLoading} />

        {/* Video background (canvas frame renderer) */}
        <VideoBackground
          isLoading={isLoading}
          onProgress={setLoadProgress}
          onComplete={() => setIsLoading(false)}
        />

        {/* Navigation */}
        <Navbar toggleMenu={() => setIsMenuOpen((v) => !v)} />
        <MobileMenu isOpen={isMenuOpen} toggleMenu={() => setIsMenuOpen(false)} />

        {/* Page sections */}
        <main>
          <Hero isLoading={isLoading} />
          <Marquee />
          <CapabilitiesSection />
          <OperatingModelSection />
          <WorkSection />
          <AboutSection />
          <ContactSection />
        </main>
      </div>
    </ReactLenis>
  );
}
