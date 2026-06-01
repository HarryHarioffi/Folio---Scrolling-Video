import { motion, useMotionValue, animate } from "motion/react";
import { useRef, useState } from "react";

export default function InteractiveBadge() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Motion values to track physical coordinates (centered at 0, 0)
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const [isDragging, setIsDragging] = useState(false);

  // Handle magnetic gravity pull on mouse movement inside wrapper bounds
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Relative coordinates from center of the container
    const relativeX = e.clientX - rect.left - centerX;
    const relativeY = e.clientY - rect.top - centerY;
    
    const distance = Math.sqrt(relativeX * relativeX + relativeY * relativeY);
    const hoverRadius = 120; // Active attraction boundary

    if (distance < hoverRadius) {
      // Soft magnetic coefficient (badge follows 22% of cursor offset)
      const targetX = relativeX * 0.22;
      const targetY = relativeY * 0.22;

      animate(x, targetX, { type: "spring", stiffness: 140, damping: 22, mass: 0.6 });
      animate(y, targetY, { type: "spring", stiffness: 140, damping: 22, mass: 0.6 });
    } else {
      handleMouseLeave();
    }
  };

  // Gracefully spring back to center when cursor leaves boundary
  const handleMouseLeave = () => {
    if (!isDragging) {
      animate(x, 0, { type: "spring", stiffness: 180, damping: 18 });
      animate(y, 0, { type: "spring", stiffness: 180, damping: 18 });
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="py-2 pr-6 pl-0 relative flex items-center justify-start pointer-events-auto select-none overflow-visible"
    >
      {/* THE DRAGGABLE INTERACTIVE GLASS BADGE */}
      <motion.div
        drag
        dragConstraints={{ left: -80, right: 80, top: -40, bottom: 40 }}
        dragElastic={0.25}
        dragSnapToOrigin={true}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        style={{ x, y }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97, cursor: "grabbing" }}
        className="relative z-10 bg-bg-surface/65 backdrop-blur-md border border-border-custom px-5 py-3 rounded-full flex items-center gap-3.5 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-shadow duration-300"
      >
        {/* Pulsing Accent-Orange LED Beacon */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-60"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-primary"></span>
        </span>

        {/* Monospaced Blueprint Code Metadata */}
        <div className="flex items-center gap-2 font-mono text-[10px] md:text-[11px] font-medium tracking-[0.18em] text-text-secondary uppercase select-none">
          <span>EST. 2026</span>
          <span className="text-text-muted/40">//</span>
          <span className="text-accent-primary">CREATIVE PARTNER ✳</span>
        </div>
      </motion.div>
    </div>
  );
}
