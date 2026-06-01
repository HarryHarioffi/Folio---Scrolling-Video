import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface LoaderProps {
  progress: number;
  isComplete: boolean;
}

const BOOT_LOGS = [
  "CALIBRATING GRID SYSTEM...",
  "ESTABLISHING DESIGN TOKENS...",
  "UNLOCKING LAYOUT PERSPECTIVES...",
  "PRE-FETCHING VECTOR GRAPHICS...",
  "DECOMPRESSING ANIMATION SPECS...",
  "RESOLVING INTERACTIVE SPECS..."
];

export default function Loader({ progress, isComplete }: LoaderProps) {
  const [activeLogIndex, setActiveLogIndex] = useState(0);

  // Strictly monotonic index progression to prevent highlights from flickering/repeating backwards
  useEffect(() => {
    const calculatedIndex = Math.min(
      Math.floor((progress / 100) * BOOT_LOGS.length),
      BOOT_LOGS.length - 1
    );
    if (calculatedIndex > activeLogIndex) {
      setActiveLogIndex(calculatedIndex);
    }
  }, [progress, activeLogIndex]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={isComplete ? { y: "-100%", opacity: 0.8 } : { y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 w-full h-screen bg-[#F5F5F0] z-[999] flex flex-col justify-between p-6 sm:p-12 md:p-16 select-none overflow-hidden font-mono text-xs text-[#0A0A0F]"
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between w-full border-b border-[#0A0A0F]/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#A23B12] animate-ping" />
          <span className="text-[#A23B12] font-bold tracking-[0.2em] text-[10px] sm:text-xs">
            FOLIO // DESIGN STUDIO
          </span>
        </div>
        <div className="text-[#0A0A0F]/30 text-[10px] sm:text-xs tracking-wider hidden sm:block">
          STATUS: READY
        </div>
      </div>

      {/* Main Grid Content (Left, Center, Right) */}
      <div className="flex-1 my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
        {/* Left Column: Boot Logs (lg: 5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-2.5 justify-center min-h-[160px]">
          {BOOT_LOGS.map((log, index) => {
            const isActive = index === activeLogIndex;
            const isFinished = index < activeLogIndex;

            return (
              <div key={log} className="flex items-center h-8 transition-all duration-300">
                {isActive ? (
                  <motion.div
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-[#A23B12] text-[#F5F5F0] font-bold px-2 py-0.5 rounded-[1px] flex items-center gap-2 shadow-[0_0_12px_rgba(162,59,18,0.1)] w-fit max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
                  >
                    <span>//</span> {log}
                  </motion.div>
                ) : (
                  <div className={`px-2 py-0.5 transition-opacity duration-300 ${isFinished ? "text-[#A23B12] opacity-60" : "text-[#0A0A0F]/20"}`}>
                    <span>//</span> {log}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Center Column: Big Progress Indicator (lg: 3 cols) */}
        <div className="lg:col-span-3 flex flex-col items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-[#A23B12]/5 rounded-full blur-2xl transform scale-150 animate-pulse" />
            <div className="relative font-display text-[clamp(3rem,6vw,5.5rem)] font-light leading-none text-[#0A0A0F] tracking-tighter">
              ({progress}%)
            </div>
          </div>
          <div className="mt-3 w-28 h-[1px] bg-[#0A0A0F]/10 relative overflow-hidden">
            <div 
              className="absolute left-0 top-0 bottom-0 bg-[#A23B12] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Right Column: Status & Blocks (lg: 4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4 lg:pl-6 justify-center min-h-[120px]">
          <div className="leading-relaxed text-[#0A0A0F]/70 text-[11px] sm:text-xs">
            <span className="text-[#A23B12] font-bold">// SYSTEM CORE:</span> SHIFTING RENDER MOMENTUM TO HIGH-FIDELITY COMPONENT PIPELINES
          </div>

          {/* Premium Animated Loading Blocks */}
          <div className="flex items-center gap-2">
            {[0, 1, 2, 3, 4].map((blockIndex) => {
              const isBlockActive = progress >= (blockIndex + 1) * 20;
              return (
                <div
                  key={blockIndex}
                  className={`w-5 h-5 border rounded-[1px] transition-all duration-300 ${
                    isBlockActive
                      ? "bg-[#1A1513] border-[#1A1513] shadow-[0_0_10px_rgba(26,21,19,0.15)]"
                      : "bg-[#F5F5F0] border-[#0A0A0F]/15"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="w-full flex justify-between items-center border-t border-[#0A0A0F]/5 pt-4 text-[9px] sm:text-[10px] text-[#0A0A0F]/30 tracking-wider uppercase">
        <span>PORT // 3000</span>
        <span>STATUS // READY</span>
      </div>
    </motion.div>
  );
}
