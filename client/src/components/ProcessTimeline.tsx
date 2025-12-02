import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Wrench, Paintbrush, Sparkles, Hammer, Search } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Assessment & Stripping",
    description: "Every project begins with a forensic inspection. We strip the vehicle down to bare metal to reveal hidden rust, previous repairs, and imperfections that need addressing.",
    icon: Search,
    image: "/images/service-restoration.jpg"
  },
  {
    id: 2,
    title: "Metal Work & Fabrication",
    description: "Our master craftsmen repair rust, fabricate custom panels, and ensure body lines are better than factory. This is the foundation of a perfect finish.",
    icon: Hammer,
    image: "/images/engine-bay-prep-1.jpg"
  },
  {
    id: 3,
    title: "Preparation & Priming",
    description: "Multiple stages of blocking and priming create a glass-smooth surface. We don't rush this step—it's the secret to deep, flawless paint.",
    icon: Wrench,
    image: "/images/engine-bay-paint-1.jpg"
  },
  {
    id: 4,
    title: "Painting & Clear Coat",
    description: "Using premium Glasurit and PPG systems, we lay down base coats and high-solids clear for incredible depth and UV protection.",
    icon: Paintbrush,
    image: "/images/service-paint.jpg"
  },
  {
    id: 5,
    title: "Cut & Polish",
    description: "The final stage involves wet sanding and multi-stage polishing to remove any texture, resulting in a mirror-like 'show car' finish.",
    icon: Sparkles,
    image: "/images/feature-detail.jpg"
  }
];

export default function ProcessTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <div ref={containerRef} className="relative bg-black py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="font-heading font-bold text-4xl md:text-5xl uppercase mb-4">The Process</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Perfection isn't an accident. It's a disciplined, multi-stage journey that transforms raw metal into automotive art.
          </p>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-white/10 -translate-x-1/2 hidden md:block" />

          <div className="space-y-24 md:space-y-40">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Image Side */}
                  <div className="w-full md:w-1/2 relative group">
                    <div className="absolute -inset-2 bg-white/5 transform rotate-2 group-hover:rotate-1 transition-transform duration-500" />
                    <div className="relative aspect-video overflow-hidden border border-white/10 bg-black">
                      <img
                        src={step.image}
                        alt={step.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                      <div className="absolute bottom-4 left-4 flex items-center gap-2">
                        <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-bold text-sm">
                          0{step.id}
                        </div>
                        <span className="text-xs uppercase tracking-widest font-bold">Stage {step.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Center Icon (Desktop) */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 bg-black border border-white/20 rounded-full items-center justify-center z-10">
                    <step.icon className="w-5 h-5 text-white" />
                  </div>

                  {/* Content Side */}
                  <div className={`w-full md:w-1/2 ${isEven ? "md:text-right" : "md:text-left"}`}>
                    <div className="flex items-center gap-3 mb-4 md:hidden">
                      <step.icon className="w-5 h-5 text-white" />
                      <span className="text-xs uppercase tracking-widest font-bold text-white/50">Stage 0{step.id}</span>
                    </div>
                    <h3 className="font-heading font-bold text-2xl md:text-3xl uppercase mb-4">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
