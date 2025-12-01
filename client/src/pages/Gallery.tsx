import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Using the generated images for the gallery
  const images = [
    { src: "/images/hero-bg.jpg", category: "Custom Paint", title: "Neon Noir Sports Car" },
    { src: "/images/service-paint.jpg", category: "Process", title: "Candy Red Application" },
    { src: "/images/service-restoration.jpg", category: "Restoration", title: "Muscle Car Restoration" },
    { src: "/images/feature-detail.jpg", category: "Detailing", title: "Carbon & Chrome Detail" },
    // Reusing images to fill the grid for demo purposes
    { src: "/images/hero-bg.jpg", category: "Custom Paint", title: "Project Midnight" },
    { src: "/images/service-paint.jpg", category: "Process", title: "Clear Coat Finish" },
  ];

  return (
    <div className="pt-24 pb-20">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-heading font-bold text-5xl md:text-6xl uppercase mb-6">
            Project <span className="text-primary">Gallery</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            A showcase of our finest work. From concours-level restorations to show-stopping custom paint jobs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative aspect-[4/3] overflow-hidden cursor-pointer border border-border bg-card"
              onClick={() => setSelectedImage(img.src)}
            >
              <img
                src={img.src}
                alt={img.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center">
                <span className="text-primary font-heading font-bold uppercase tracking-widest text-sm mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  {img.category}
                </span>
                <h3 className="text-white font-heading font-bold text-2xl uppercase translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                  {img.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white hover:text-primary transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-10 h-10" />
          </button>
          <img 
            src={selectedImage} 
            alt="Gallery Preview" 
            className="max-w-full max-h-full object-contain shadow-2xl border border-border"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
