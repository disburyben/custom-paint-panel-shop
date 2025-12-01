import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { SprayCan } from "lucide-react";

export default function RollerDoorLoader({ onComplete }: { onComplete?: () => void }) {
  const [step, setStep] = useState<'initial' | 'painting' | 'ready' | 'opening'>('initial');
  const [isVisible, setIsVisible] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Lock body scroll when loader is active
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleStartPainting = () => {
    setStep('painting');
    if (videoRef.current) {
      videoRef.current.play();
    }
    // Video is approx 4-5 seconds, wait for it to finish painting the button
    setTimeout(() => {
      setStep('ready');
    }, 4000);
  };

  const handleEnter = () => {
    setStep('opening');
  };

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={step === 'opening' ? { y: "-100%" } : { y: 0 }}
      transition={{ 
        duration: 1.5, 
        ease: [0.45, 0, 0.55, 1], // Cubic bezier for a heavy mechanical feel
      }}
      onAnimationComplete={() => {
        if (step === 'opening') {
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
        <div className="relative z-20 flex flex-col items-center gap-8 max-w-md w-full px-4">
          
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <img 
              src="/images/logo-full.png" 
              alt="Caspers Paintworks" 
              className="h-32 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] grayscale brightness-150 contrast-125" 
            />
          </motion.div>

          {/* Interaction Area */}
          <div className="relative w-full aspect-video bg-black/50 rounded-lg overflow-hidden border border-white/10 shadow-2xl">
            {/* Video Layer */}
            <video
              ref={videoRef}
              src="/images/painter-button-reveal.mp4"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${step === 'initial' ? 'opacity-0' : 'opacity-100'}`}
              muted
              playsInline
            />

            {/* Initial State: "Paint to Reveal" Button */}
            <AnimatePresence>
              {step === 'initial' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                >
                  <Button 
                    onClick={handleStartPainting}
                    size="lg"
                    className="bg-white text-black hover:bg-neutral-200 font-heading uppercase tracking-widest text-lg px-8 py-6 h-auto border-2 border-white/20"
                  >
                    <SprayCan className="mr-3 h-6 w-6" />
                    Paint to Reveal
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ready State: "Enter Shop" Button */}
            <AnimatePresence>
              {step === 'ready' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
                >
                  <Button 
                    onClick={handleEnter}
                    size="lg"
                    className="bg-white text-black hover:bg-neutral-200 font-heading uppercase tracking-widest text-xl px-12 py-8 h-auto border-4 border-white shadow-[0_0_30px_rgba(255,255,255,0.3)] animate-pulse"
                  >
                    Enter Shop
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-neutral-500 text-sm uppercase tracking-[0.3em] font-body text-center"
          >
            {step === 'initial' ? "Initialize Sequence" : step === 'painting' ? "Applying Finish..." : "Access Granted"}
          </motion.p>
        </div>

        {/* Bottom Handle/Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#050505] border-t border-white/10 flex items-center justify-center shadow-[0_-10px_20px_rgba(0,0,0,0.8)]">
          <div className="w-32 h-3 rounded-full bg-neutral-800 shadow-inner" />
        </div>
      </div>
    </motion.div>
  );
}
