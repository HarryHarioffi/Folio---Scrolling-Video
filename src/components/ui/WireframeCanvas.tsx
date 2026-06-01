import { useEffect, useRef } from "react";

export default function WireframeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set high-DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const size = 120;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    // Generate globe vertices & edges
    const vertices: { x: number; y: number; z: number }[] = [];
    const edges: [number, number][] = [];
    const latCount = 5;
    const lonCount = 10;
    const radius = 45;

    for (let i = 0; i < latCount; i++) {
      const theta = (i * Math.PI) / (latCount - 1);
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      for (let j = 0; j < lonCount; j++) {
        const phi = (j * 2 * Math.PI) / lonCount;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
        vertices.push({
          x: radius * sinTheta * cosPhi,
          y: radius * cosTheta,
          z: radius * sinTheta * sinPhi,
        });
      }
    }

    for (let i = 0; i < latCount; i++) {
      for (let j = 0; j < lonCount; j++) {
        const idx = i * lonCount + j;
        const nextLonIdx = i * lonCount + ((j + 1) % lonCount);
        edges.push([idx, nextLonIdx]);
        if (i < latCount - 1) {
          const nextLatIdx = (i + 1) * lonCount + j;
          edges.push([idx, nextLatIdx]);
        }
      }
    }

    let angleX = 0.3;
    let angleY = 0.5;
    let isHovered = false;
    let animationId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      
      // Target angles based on mouse distance from shape center
      mouseRef.current.targetX = dy * 0.005;
      mouseRef.current.targetY = dx * 0.005;

      // Check if mouse is hovering over the shape viewport
      const distance = Math.sqrt(dx * dx + dy * dy);
      isHovered = distance < 60;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, size, size);

      // Smoothly interpolate rotation angles towards mouse targets
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      // Base rotation + mouse rotation
      angleX += 0.004 + mouseRef.current.x * 0.02;
      angleY += 0.006 + mouseRef.current.y * 0.02;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      const cx = size / 2;
      const cy = size / 2;

      // Project vertices to 2D
      const projected = vertices.map((v) => {
        // Rotate Y
        let x1 = v.x * cosY - v.z * sinY;
        let z1 = v.x * sinY + v.z * cosY;

        // Rotate X
        let y2 = v.y * cosX - z1 * sinX;
        let z2 = v.y * sinX + z1 * cosX;

        return {
          x: cx + x1,
          y: cy + y2,
          z: z2,
        };
      });

      // Set styles based on hover state
      ctx.lineWidth = isHovered ? 0.75 : 0.4;
      const accentColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--accent-primary")
        .trim() || "#A23B12";

      edges.forEach(([i, j]) => {
        const p1 = projected[i];
        const p2 = projected[j];
        
        // Depth cueing: fade lines in background
        const avgZ = (p1.z + p2.z) / 2;
        const alpha = Math.max(0.05, Math.min(0.9, 0.5 - avgZ * 0.006));
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        
        if (isHovered) {
          ctx.strokeStyle = `${accentColor}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
        } else {
          ctx.strokeStyle = `rgba(26, 21, 19, ${alpha * 0.65})`;
        }
        ctx.stroke();
      });

      // Draw vertices
      projected.forEach((p) => {
        const dotAlpha = Math.max(0.1, Math.min(1.0, 0.6 - p.z * 0.007));
        ctx.beginPath();
        ctx.arc(p.x, p.y, isHovered ? 1.5 : 1, 0, Math.PI * 2);
        
        if (isHovered) {
          ctx.fillStyle = `${accentColor}${Math.floor(dotAlpha * 255).toString(16).padStart(2, '0')}`;
        } else {
          ctx.fillStyle = `rgba(26, 21, 19, ${dotAlpha * 0.5})`;
        }
        ctx.fill();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="w-32 h-32 flex items-center justify-center border border-border-custom relative rounded-[2px] bg-bg-surface/10 backdrop-blur-[1px] hover:border-accent-primary transition-colors duration-300">
      {/* CAD viewport crosshairs */}
      <div className="absolute w-full h-[1px] bg-border-custom opacity-20 pointer-events-none" />
      <div className="absolute h-full w-[1px] bg-border-custom opacity-20 pointer-events-none" />
      {/* Corner indicators */}
      <div className="absolute w-1.5 h-1.5 border-t border-l border-border-custom opacity-40 top-1 left-1" />
      <div className="absolute w-1.5 h-1.5 border-t border-r border-border-custom opacity-40 top-1 right-1" />
      <div className="absolute w-1.5 h-1.5 border-b border-l border-border-custom opacity-40 bottom-1 left-1" />
      <div className="absolute w-1.5 h-1.5 border-b border-r border-border-custom opacity-40 bottom-1 right-1" />
      <canvas ref={canvasRef} className="z-10" />
      {/* Mini label */}
      <span className="absolute bottom-1 right-2 font-mono text-[7px] text-text-muted tracking-widest pointer-events-none select-none uppercase">
        SYS_3D
      </span>
    </div>
  );
}
