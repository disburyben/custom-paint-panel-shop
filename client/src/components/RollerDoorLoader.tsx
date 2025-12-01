import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function RollerDoorLoader({ onComplete }: { onComplete?: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Lock body scroll when loader is active
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: "-100%" }}
      transition={{ 
        duration: 1.5, 
        ease: [0.45, 0, 0.55, 1], // Cubic bezier for a heavy mechanical feel
        delay: 1.5 // Wait a bit before opening so user sees the door
      }}
      onAnimationComplete={() => {
        setIsVisible(false);
        document.body.style.overflow = "unset";
        onComplete?.();
      }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-end pointer-events-none"
      style={{ display: isVisible ? "flex" : "none" }}
    >
      {/* The Roller Door */}
      <div className="w-full h-full bg-[#1a1a1a] relative shadow-2xl">
        {/* Corrugated Metal Texture */}
        <div 
          className="absolute inset-0 w-full h-full opacity-50"
          style={{
            backgroundImage: "repeating-linear-gradient(180deg, #000000 0px, #2a2a2a 15px, #000000 30px)"
          }}
        />
        
        {/* Vertical Rails (Visual only) */}
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-black/50 border-r border-white/10" />
        <div className="absolute right-0 top-0 bottom-0 w-4 bg-black/50 border-l border-white/10" />

        {/* Logo on the door */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-black/80 p-8 border-2 border-primary/50 backdrop-blur-sm skew-x-[-10deg]">
            <div className="flex flex-col items-center skew-x-[10deg]">
              <img src="/images/logo-full.png" alt="Caspers Paintworks" className="h-32 w-auto object-contain drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]" />
            </div>
          </div>
        </div>

        {/* Bottom Handle/Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#111] border-t border-white/20 flex items-center justify-center shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
          <div className="w-32 h-3 rounded-full bg-neutral-700 shadow-inner" />
        </div>
      </div>
    </motion.div>
  );
}
