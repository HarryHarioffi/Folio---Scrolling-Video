/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, X } from "lucide-react";
import { NAV_ITEMS } from "../data/content";
import FolioLogo from "./ui/FolioLogo";
import { useLenis } from "lenis/react";

interface MobileMenuProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

export default function MobileMenu({ isOpen, toggleMenu }: MobileMenuProps) {
  const lenis = useLenis();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    toggleMenu();
    if (lenis) {
      setTimeout(() => {
        lenis.scrollTo(targetId, {
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      }, 100);
    } else {
      const el = document.querySelector(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 w-full h-screen bg-bg-void z-[110] flex flex-col p-5 sm:p-8 md:p-12 overflow-hidden"
        >
          {/* Top Row */}
          <div className="flex items-center justify-between w-full">
            <div className="text-text-primary">
              <FolioLogo className="h-5 md:h-6 w-auto" />
            </div>
            <button
              onClick={toggleMenu}
              className="w-9 h-9 rounded-full bg-bg-raised border border-border-custom flex items-center justify-center hover:bg-bg-surface transition-colors"
            >
              <X size={18} className="text-text-primary" />
            </button>
          </div>

          {/* Links */}
          <div className="mt-16 flex flex-col">
            {NAV_ITEMS.map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="border-b border-border-custom py-4"
              >
                <a
                  href={`#${item.toLowerCase()}`}
                  onClick={(e) => handleLinkClick(e, `#${item.toLowerCase()}`)}
                  className="font-display text-[clamp(2.5rem,10vw,5rem)] text-text-primary uppercase leading-tight block"
                >
                  {item}
                </a>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-auto pb-4">
            <a 
              href="#contact" 
              onClick={(e) => handleLinkClick(e, "#contact")} 
              className="flex items-center gap-2 font-sans text-lg font-medium text-accent-primary group"
            >
              Start a Project
              <ArrowUpRight size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
