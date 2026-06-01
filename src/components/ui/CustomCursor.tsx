import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";

export default function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for a high-end physical lag/inertia effect
  const cursorX = useSpring(mouseX, { stiffness: 700, damping: 38, mass: 0.12 });
  const cursorY = useSpring(mouseY, { stiffness: 700, damping: 38, mass: 0.12 });

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Smart check: matches common interactive elements or anything styled with a pointer cursor
      const isClickable =
        target.closest('a, button, [role="button"], input[type="submit"], input[type="button"], [onclick], .cursor-pointer, [data-interactive]') ||
        window.getComputedStyle(target).cursor === "pointer";

      setIsHovered(!!isClickable);
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);

    // Hide native cursor on mount
    document.body.classList.add("custom-cursor-active");

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
      document.body.classList.remove("custom-cursor-active");
    };
  }, [isVisible, mouseX, mouseY]);

  if (!isVisible) return null;

  return (
    <motion.div
      style={{
        x: cursorX,
        y: cursorY,
        translateX: "-50%",
        translateY: "-50%",
      }}
      className="pointer-events-none fixed top-0 left-0 z-[9999] hidden md:block mix-blend-difference"
      animate={isHovered ? "target" : "default"}
      initial="default"
    >
      <div className="relative w-10 h-10 flex items-center justify-center">
        {/* Fine crosshair lines */}
        <motion.div 
          variants={{
            default: { scale: 1, opacity: 0.45 },
            target: { scale: 1.6, opacity: 0.85 }
          }}
          className="absolute w-5 h-[1px] bg-white" 
        />
        <motion.div 
          variants={{
            default: { scale: 1, opacity: 0.45 },
            target: { scale: 1.6, opacity: 0.85 }
          }}
          className="absolute h-5 w-[1px] bg-white" 
        />

        {/* Center dot (colored orange in target mode for maximum contrast/pop) */}
        <motion.div 
          variants={{
            default: { scale: 1, backgroundColor: "#ffffff" },
            target: { scale: 1.5, backgroundColor: "#E65100" }
          }}
          className="w-1.5 h-1.5 rounded-full bg-white z-10" 
        />

        {/* Outer Tech Reticle Frame */}
        <motion.div
          variants={{
            default: { 
              width: "16px", 
              height: "16px", 
              rotate: 0, 
              borderRadius: "0px",
              borderColor: "rgba(255, 255, 255, 0.45)",
              borderWidth: "1px"
            },
            target: { 
              width: "26px", 
              height: "26px", 
              rotate: 90, 
              borderRadius: "50%",
              borderColor: "rgba(255, 255, 255, 0.95)",
              borderWidth: "1.5px"
            }
          }}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
          className="absolute border border-white/40 flex items-center justify-center"
        >
          {/* Outer target compass corners (visible when targeting clickable element) */}
          <motion.div
            variants={{
              default: { opacity: 0 },
              target: { opacity: 1 }
            }}
            className="absolute inset-0"
          >
            <div className="absolute w-1 h-1 border-t border-l border-white -top-1 -left-1" />
            <div className="absolute w-1 h-1 border-t border-r border-white -top-1 -right-1" />
            <div className="absolute w-1 h-1 border-b border-l border-white -bottom-1 -left-1" />
            <div className="absolute w-1 h-1 border-b border-r border-white -bottom-1 -right-1" />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
