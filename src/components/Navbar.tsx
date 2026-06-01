/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { NAV_ITEMS } from "../data/content";
import FolioLogo from "./ui/FolioLogo";
import { useLenis } from "lenis/react";

interface NavbarProps {
  toggleMenu: () => void;
}

export default function Navbar({ toggleMenu }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const lenis = useLenis();

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const atTop = currentY <= 60;

      setScrolled(!atTop);

      if (atTop) {
        // Always show at top
        setVisible(true);
      } else if (currentY > lastScrollY.current + 5) {
        // Scrolling down — hide
        setVisible(false);
      } else if (currentY < lastScrollY.current - 5) {
        // Scrolling up — show
        setVisible(true);
      }

      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    if (lenis) {
      lenis.scrollTo(targetId, {
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo out easing
      });
    } else {
      const el = document.querySelector(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleLogoClick = () => {
    if (lenis) {
      lenis.scrollTo(0, {
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: visible ? 0 : -100 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 w-full z-[100] transition-colors duration-250 ${scrolled ? "bg-bg-void backdrop-blur-xl" : "bg-transparent"
        } px-5 sm:px-8 md:px-12 py-5 md:py-6 flex items-center justify-between`}
    >
      {/* Left Logo */}
      <div className="cursor-pointer text-text-primary" onClick={handleLogoClick}>
        <FolioLogo className="h-5 md:h-6 w-auto" />
      </div>

      {/* Center Nav */}
      <div className="hidden md:flex items-center gap-12">
        {NAV_ITEMS.map((item, i) => (
          <motion.a
            key={item}
            href={`#${item.toLowerCase()}`}
            onClick={(e) => handleNavClick(e, `#${item.toLowerCase()}`)}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 * (i + 1), ease: [0.22, 1, 0.36, 1] }}
            className="font-sans text-[14px] font-normal uppercase tracking-[0.08em] text-text-secondary hover:text-text-primary transition-colors duration-200"
          >
            {item}
          </motion.a>
        ))}
      </div>

      {/* Right Hamburger */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        onClick={toggleMenu}
        className="w-9 h-9 rounded-full bg-bg-raised border border-border-custom flex flex-col items-center justify-center gap-1.5 hover:bg-bg-surface transition-colors duration-200"
      >
        <span className="w-4 h-px bg-text-primary"></span>
        <span className="w-4 h-px bg-text-primary"></span>
        <span className="w-4 h-px bg-text-primary"></span>
      </motion.button>
    </motion.nav>
  );
}
