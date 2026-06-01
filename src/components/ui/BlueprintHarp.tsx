import { useEffect, useRef } from "react";

interface HarpString {
  y: number;
  cy: number;
  cx: number;
  vy: number;
  isStretched: boolean;
  lastMouseY: number;
}

export default function BlueprintHarp() {
  const containerRef = useRef<HTMLDivElement>(null);
  const widthRef = useRef(800);
  const prevMouseYRef = useRef<number | null>(null);

  const stringsRef = useRef<HarpString[]>([
    { y: 30, cy: 30, cx: 400, vy: 0, isStretched: false, lastMouseY: 0 },
    { y: 65, cy: 65, cx: 400, vy: 0, isStretched: false, lastMouseY: 0 },
    { y: 100, cy: 100, cx: 400, vy: 0, isStretched: false, lastMouseY: 0 },
    { y: 135, cy: 135, cx: 400, vy: 0, isStretched: false, lastMouseY: 0 }
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Handle width adjustments dynamically on screen resize
    const updateSize = () => {
      widthRef.current = container.getBoundingClientRect().width;
      stringsRef.current.forEach((str, idx) => {
        const path = document.getElementById(`harp-string-${idx}`);
        if (path && !str.isStretched && str.vy === 0) {
          path.setAttribute("d", `M 0 ${str.y} Q ${widthRef.current / 2} ${str.y} ${widthRef.current} ${str.y}`);
        }
      });
    };

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);
    updateSize();

    // Physics parameters
    const stiffness = 0.05;
    const damping = 0.93;
    let animationId: number;

    const render = () => {
      stringsRef.current.forEach((str, idx) => {
        const path = document.getElementById(`harp-string-${idx}`);
        const label = document.getElementById(`harp-label-${idx}`);
        if (!path) return;

        if (str.isStretched) {
          // Bounded curvature update during drag
          path.setAttribute("d", `M 0 ${str.y} Q ${str.cx} ${str.cy} ${widthRef.current} ${str.y}`);
          path.setAttribute("stroke", "var(--color-accent-primary)");
          path.setAttribute("opacity", "0.95");
          
          if (label) {
            const disp = Math.round(str.cy - str.y);
            label.textContent = `DX: ${disp > 0 ? "+" : ""}${disp}PX`;
            label.setAttribute("x", Math.max(20, Math.min(widthRef.current - 50, str.cx)).toString());
            label.setAttribute("y", (str.cy - 10).toString());
            label.setAttribute("opacity", "0.8");
          }
        } else if (str.vy !== 0 || str.cy !== str.y) {
          // Euler integration for spring physics
          const force = (str.y - str.cy) * stiffness;
          str.vy += force;
          str.vy *= damping;
          str.cy += str.vy;

          // Underflow cutoff
          if (Math.abs(str.cy - str.y) < 0.05 && Math.abs(str.vy) < 0.05) {
            str.cy = str.y;
            str.vy = 0;
            if (label) label.setAttribute("opacity", "0");
          }

          path.setAttribute("d", `M 0 ${str.y} Q ${str.cx} ${str.cy} ${widthRef.current} ${str.y}`);
          const disp = Math.abs(str.cy - str.y);
          path.setAttribute("stroke", "var(--color-accent-primary)");
          path.setAttribute("opacity", Math.max(0.2, Math.min(0.9, 0.2 + disp * 0.035)).toString());

          if (label && Math.abs(str.vy) > 0.1) {
            const val = Math.round(str.cy - str.y);
            label.textContent = `DX: ${val > 0 ? "+" : ""}${val}PX`;
            label.setAttribute("x", Math.max(20, Math.min(widthRef.current - 50, str.cx)).toString());
            label.setAttribute("y", (str.cy - 10).toString());
            label.setAttribute("opacity", Math.max(0, Math.min(0.7, disp * 0.02)).toString());
          }
        } else {
          // Neutral resting state
          path.setAttribute("d", `M 0 ${str.y} Q ${widthRef.current / 2} ${str.y} ${widthRef.current} ${str.y}`);
          path.setAttribute("stroke", "var(--color-border-custom)");
          path.setAttribute("opacity", "0.2");
          if (label) label.setAttribute("opacity", "0");
        }
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (prevMouseYRef.current !== null) {
      const pmY = prevMouseYRef.current;
      stringsRef.current.forEach((str) => {
        // 1. Detect strum (crossing baseline coordinate)
        const crossed = (pmY - str.y) * (mouseY - str.y) < 0;
        if (crossed && !str.isStretched) {
          str.isStretched = true;
          str.cx = mouseX;
          str.cy = mouseY;
          str.vy = 0;
          str.lastMouseY = mouseY;
        }

        // 2. Drag updating
        if (str.isStretched) {
          const maxDisplacement = 48; // Max displacement in px
          const diff = mouseY - str.y;
          const cappedDiff = Math.max(-maxDisplacement, Math.min(maxDisplacement, diff));
          
          str.cx = mouseX;
          str.cy = str.y + cappedDiff;
          
          // Speed mapping
          const speed = mouseY - str.lastMouseY;
          str.lastMouseY = mouseY;

          // 3. Strum release check
          if (Math.abs(diff) > maxDisplacement - 2) {
            str.isStretched = false;
            str.vy = speed * 1.5; // Transfer velocity to spring swing
          }
        }
      });
    }

    prevMouseYRef.current = mouseY;
  };

  const handleMouseLeave = () => {
    prevMouseYRef.current = null;
    stringsRef.current.forEach((str) => {
      if (str.isStretched) {
        str.isStretched = false;
        str.vy = 0; // Release back to spring naturally
      }
    });
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full h-[165px] relative pointer-events-auto cursor-ns-resize select-none overflow-visible"
    >
      {/* Schematic Guide viewfinders in corners of harp viewport */}
      <div className="absolute w-2 h-2 border-t border-l border-border-custom opacity-40 top-0 left-0" />
      <div className="absolute w-2 h-2 border-t border-r border-border-custom opacity-40 top-0 right-0" />
      <div className="absolute w-2 h-2 border-b border-l border-border-custom opacity-40 bottom-0 left-0" />
      <div className="absolute w-2 h-2 border-b border-r border-border-custom opacity-40 bottom-0 right-0" />

      <svg className="w-full h-full absolute inset-0 pointer-events-none overflow-visible">
        {/* Ticks & Grid Background Lines */}
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="var(--color-border-custom)" strokeWidth="0.5" strokeDasharray="2 6" />

        {/* 4 Pluckable strings */}
        {Array.from({ length: 4 }).map((_, idx) => (
          <path
            key={idx}
            id={`harp-string-${idx}`}
            fill="none"
            strokeWidth="1.2"
            className="transition-colors duration-200"
          />
        ))}

        {/* 4 Displacement label overlays */}
        {Array.from({ length: 4 }).map((_, idx) => (
          <text
            key={idx}
            id={`harp-label-${idx}`}
            className="fill-accent-primary font-mono text-[7px] font-bold uppercase tracking-wider select-none pointer-events-none"
            opacity="0"
          />
        ))}
      </svg>
    </div>
  );
}
