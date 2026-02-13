import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

export default function RollerDoorLoader({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0);
  const [isOpening, setIsOpening] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Lock body scroll when loader is active
    document.body.style.overflow = "hidden";

    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsOpening(true);
          return 100;
        }
        // Random increment for realistic feel
        return Math.min(prev + Math.random() * 15, 100);
      });
    }, 200);

    return () => {
      document.body.style.overflow = "unset";
      clearInterval(interval);
    };
  }, []);

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={isOpening ? { y: "-100%" } : { y: 0 }}
      transition={{ 
        duration: 2.5, // Slow opening as requested
        ease: [0.45, 0, 0.55, 1], // Heavy mechanical feel
        delay: 0.2
      }}
      onAnimationComplete={() => {
        if (isOpening) {
          setIsVisible(false);
          document.body.style.overflow = "unset";
          onComplete?.();
        }
      }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-end"
      style={{ display: isVisible ? "flex" : "none" }}
    >
      {/* The Roller Door */}
      <div className="w-full h-full bg-[#0a0a0a] relative shadow-2xl flex flex-col items-center justify-center overflow-hidden">
        {/* Corrugated Metal Texture */}
        <div 
          className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
          style={{
            backgroundImage: "repeating-linear-gradient(180deg, #000000 0px, #1a1a1a 15px, #000000 30px)"
          }}
        />
        
        {/* Vertical Rails (Visual only) */}
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-black/50 border-r border-white/10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-4 bg-black/50 border-l border-white/10 pointer-events-none" />

        {/* Content Container */}
        <div className="relative z-20 flex flex-col items-center gap-12 max-w-md w-full px-8">
          
          {/* Logo */}
          <div className="mb-4">
            <img 
              src="/images/logo-full.png" 
              alt="Caspers Paintworks" 
              className="h-40 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] grayscale brightness-150 contrast-125" 
            />
          </div>

          {/* Loading Progress */}
          <div className="w-full flex flex-col gap-4">
            <div className="flex justify-between text-xs uppercase tracking-[0.2em] text-neutral-500 font-heading">
              <span>System Loading</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1 bg-neutral-900 [&>div]:bg-white" />
          </div>
        </div>

        {/* Bottom Handle/Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#050505] border-t border-white/10 flex items-center justify-center shadow-[0_-10px_20px_rgba(0,0,0,0.8)]">
          <div className="w-32 h-3 rounded-full bg-neutral-800 shadow-inner" />
        </div>
      </div>
    </motion.div>
  );
}
