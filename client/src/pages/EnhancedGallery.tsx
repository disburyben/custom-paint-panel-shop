import { useState } from "react";
import { motion } from "framer-motion";
import { X, Loader2, Award, BadgeCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";

export default function EnhancedGallery() {
  const seoConfig = {
    title: "Gallery - Before & After Project Showcase",
    description: "View our professional automotive refinishing and custom paint projects. Before and after gallery showcasing quality workmanship.",
    image: "/og-image.jpg",
    url: "/gallery",
  };

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSprayer, setSelectedSprayer] = useState<number | null>(null);

  // Fetch data
  const { data: galleryItems = [], isLoading: galleryLoading } =
    trpc.gallery.getActiveItems.useQuery();
  const { data: sprayers = [] } = trpc.sprayer.getActiveSprayers.useQuery();

  // Get unique categories
  const categories = Array.from(
    new Set(galleryItems.map((item: any) => item.category))
  );

  // Filter gallery items
  const filteredItems = galleryItems.filter((item: any) => {
    if (selectedCategory && item.category !== selectedCategory) return false;
    if (selectedSprayer && item.sprayerId !== selectedSprayer) return false;
    return true;
  });

  return (
    <div className="pt-24 pb-20">
      <SEOHead config={seoConfig} includeLocalBusiness={true} />
      <div className="container">
        {/* Gallery Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-heading font-bold text-5xl md:text-6xl uppercase mb-6">
            Project <span className="text-primary">Gallery</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            A showcase of our finest work. From concours-level restorations to
            show-stopping custom paint jobs.
          </p>
        </div>

        {/* Sprayers Showcase */}
        {sprayers.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="font-heading font-bold text-4xl uppercase mb-4">
                Our <span className="text-primary">Master Craftsmen</span>
              </h2>
              <p className="text-muted-foreground">
                Click on any sprayer to filter their work
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <button
                onClick={() => setSelectedSprayer(null)}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  selectedSprayer === null
                    ? "bg-primary text-primary-foreground shadow-lg scale-105"
                    : "bg-card border border-border text-foreground hover:border-primary"
                }`}
              >
                All Sprayers
              </button>
              {sprayers.map((sprayer: any) => (
                <button
                  key={sprayer.id}
                  onClick={() => setSelectedSprayer(sprayer.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all ${
                    selectedSprayer === sprayer.id
                      ? "bg-primary text-primary-foreground shadow-lg scale-105"
                      : "bg-card border border-border text-foreground hover:border-primary"
                  }`}
                >
                  {sprayer.logoUrl && (
                    <img
                      src={sprayer.logoUrl}
                      alt={sprayer.name}
                      className="w-5 h-5 object-contain"
                    />
                  )}
                  {sprayer.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedCategory === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-foreground hover:border-primary"
              }`}
            >
              All Projects
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-md font-medium transition-colors capitalize ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-foreground hover:border-primary"
                }`}
              >
                {category.replace("-", " ")}
              </button>
            ))}
          </div>
        )}

        {/* Gallery Grid */}
        {galleryLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">
              No projects available with the selected filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item: any, index: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <div className="relative bg-card border border-border overflow-hidden hover:border-primary transition-all duration-300 hover:shadow-xl">
                  {/* Before/After Comparison */}
                  <div className="grid grid-cols-2 gap-0">
                    <div
                      className="group/before relative aspect-[4/3] overflow-hidden cursor-pointer"
                      onClick={() => setSelectedImage(item.beforeImageUrl)}
                    >
                      <img
                        src={item.beforeImageUrl}
                        alt={`${item.title} - Before`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/before:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/before:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="text-white font-heading font-bold uppercase text-xs">
                          Before
                        </span>
                      </div>
                    </div>
                    <div
                      className="group/after relative aspect-[4/3] overflow-hidden cursor-pointer"
                      onClick={() => setSelectedImage(item.afterImageUrl)}
                    >
                      <img
                        src={item.afterImageUrl}
                        alt={`${item.title} - After`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/after:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/after:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="text-white font-heading font-bold uppercase text-xs">
                          After
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="p-5 space-y-3">
                    {/* Title */}
                    <h3 className="font-heading font-bold text-xl uppercase group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>

                    {/* Vehicle Type Badge */}
                    {item.vehicleType && (
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-zinc-900/50 border-zinc-700 text-zinc-300"
                        >
                          {item.vehicleType}
                        </Badge>
                      </div>
                    )}

                    {/* Services Provided */}
                    {item.servicesProvided && (
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                          Services:
                        </p>
                        <p className="text-sm text-foreground/90 leading-relaxed">
                          {item.servicesProvided}
                        </p>
                      </div>
                    )}

                    {/* Description */}
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    {/* Sprayer Info */}
                    {item.sprayer && (
                      <div className="pt-3 border-t border-border/50">
                        <div className="flex items-center gap-3">
                          {item.sprayer.logoUrl ? (
                            <img
                              src={item.sprayer.logoUrl}
                              alt={item.sprayer.name}
                              className="w-10 h-10 object-contain bg-zinc-900/50 rounded p-1 border border-zinc-800"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-zinc-900/50 rounded flex items-center justify-center border border-zinc-800">
                              <Award className="w-5 h-5 text-primary" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground">
                              Crafted by
                            </p>
                            <p className="font-heading font-bold text-sm uppercase text-primary">
                              {item.sprayer.name}
                            </p>
                            {item.sprayer.title && (
                              <p className="text-xs text-muted-foreground">
                                {item.sprayer.title}
                              </p>
                            )}
                            {item.sprayer.certifications && (
                              <div className="mt-2 space-y-1">
                                {item.sprayer.certifications
                                  .split("\n")
                                  .filter((cert: string) => cert.trim())
                                  .map((cert: string, idx: number) => (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-1.5 text-xs text-muted-foreground"
                                    >
                                      <BadgeCheck className="w-3 h-3 text-primary flex-shrink-0" />
                                      <span className="line-clamp-1">{cert.trim()}</span>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Featured Badge */}
                    {item.isFeatured === 1 && (
                      <div className="pt-2">
                        <Badge className="bg-primary text-primary-foreground font-bold uppercase text-xs">
                          Featured Project
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Image Lightbox */}
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
