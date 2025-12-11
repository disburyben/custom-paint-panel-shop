import { useState } from "react";
import { motion } from "framer-motion";
import { X, User, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTeamMember, setSelectedTeamMember] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch data
  const { data: teamMembers } = trpc.team.list.useQuery();
  const { data: memberPortfolio } = trpc.team.getWithPortfolio.useQuery(
    { id: selectedTeamMember! },
    { enabled: !!selectedTeamMember }
  );
  const { data: galleryItems = [], isLoading: galleryLoading } = trpc.cms.gallery.getAll.useQuery();

  // Get unique categories
  const categories = Array.from(new Set(galleryItems.map((item: any) => item.category)));

  // Filter gallery items by selected category
  const filteredItems = selectedCategory 
    ? galleryItems.filter((item: any) => item.category === selectedCategory)
    : galleryItems;

  return (
    <div className="pt-24 pb-20">
      <div className="container">
        {/* Gallery Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-heading font-bold text-5xl md:text-6xl uppercase mb-6">
            Project <span className="text-primary">Gallery</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            A showcase of our finest work. From concours-level restorations to show-stopping custom paint jobs.
          </p>
        </div>

        {/* Team Showcase Section */}
        {teamMembers && teamMembers.length > 0 && (
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="font-heading font-bold text-4xl uppercase mb-4">
                Meet Our <span className="text-primary">Artists</span>
              </h2>
              <p className="text-muted-foreground">
                Click on any team member to explore their unique style and portfolio
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {teamMembers.map((member) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group cursor-pointer"
                  onClick={() => setSelectedTeamMember(member.id)}
                >
                  <div className="relative aspect-square overflow-hidden border-2 border-border bg-card mb-4 transition-all duration-300 group-hover:border-primary">
                    {member.headshotUrl ? (
                      <img
                        src={member.headshotUrl}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                        <User className="w-24 h-24 text-zinc-700" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-heading font-bold text-2xl uppercase mb-1 group-hover:text-primary transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-primary text-sm uppercase tracking-wider mb-2">{member.title}</p>
                    {member.specialty && (
                      <p className="text-muted-foreground text-sm">{member.specialty}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Project Gallery */}
        <div className="mb-12">
          <h2 className="font-heading font-bold text-4xl uppercase text-center mb-12">
            Recent <span className="text-primary">Projects</span>
          </h2>

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
                  {category}
                </button>
              ))}
            </div>
          )}

          {galleryLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No projects available in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item: any, index: number) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  {/* Before/After Comparison */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div
                      className="group/before relative aspect-[4/3] overflow-hidden cursor-pointer border border-border bg-card"
                      onClick={() => setSelectedImage(item.beforeImageUrl)}
                    >
                      <img
                        src={item.beforeImageUrl}
                        alt={`${item.title} - Before`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/before:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/before:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="text-white font-heading font-bold uppercase text-xs">Before</span>
                      </div>
                    </div>
                    <div
                      className="group/after relative aspect-[4/3] overflow-hidden cursor-pointer border border-border bg-card"
                      onClick={() => setSelectedImage(item.afterImageUrl)}
                    >
                      <img
                        src={item.afterImageUrl}
                        alt={`${item.title} - After`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/after:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/after:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="text-white font-heading font-bold uppercase text-xs">After</span>
                      </div>
                    </div>
                  </div>

                  {/* Project Info */}
                  <h3 className="font-heading font-bold text-lg uppercase mb-1 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-primary text-sm uppercase tracking-wider mb-2 capitalize">
                    {item.category}
                  </p>
                  {item.description && (
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  {item.isFeatured === 1 && (
                    <div className="mt-2 inline-block bg-primary text-primary-foreground text-xs font-bold px-2 py-1 uppercase">
                      Featured
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
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

      {/* Team Member Portfolio Dialog */}
      <Dialog open={!!selectedTeamMember} onOpenChange={() => setSelectedTeamMember(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-background">
          {memberPortfolio && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-6 mb-4">
                  {memberPortfolio.member.headshotUrl && (
                    <img
                      src={memberPortfolio.member.headshotUrl}
                      alt={memberPortfolio.member.name}
                      className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                    />
                  )}
                  <div>
                    <DialogTitle className="font-heading text-3xl uppercase mb-1">
                      {memberPortfolio.member.name}
                    </DialogTitle>
                    <p className="text-primary uppercase tracking-wider text-sm">
                      {memberPortfolio.member.title}
                    </p>
                    {memberPortfolio.member.specialty && (
                      <p className="text-muted-foreground text-sm mt-1">
                        {memberPortfolio.member.specialty}
                      </p>
                    )}
                  </div>
                </div>
                {memberPortfolio.member.bio && (
                  <p className="text-muted-foreground">{memberPortfolio.member.bio}</p>
                )}
              </DialogHeader>

              <div className="mt-6">
                <h3 className="font-heading font-bold text-2xl uppercase mb-6">
                  Portfolio <span className="text-primary">({memberPortfolio.portfolio.length})</span>
                </h3>
                
                {memberPortfolio.portfolio.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {memberPortfolio.portfolio.map((item) => (
                      <div key={item.id} className="group">
                        <div className="relative aspect-[4/3] overflow-hidden border border-border bg-card mb-3 cursor-pointer"
                          onClick={() => setSelectedImage(item.imageUrl)}
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          {item.isFeatured === 1 && (
                            <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 uppercase">
                              Featured
                            </div>
                          )}
                        </div>
                        <h4 className="font-heading font-bold uppercase mb-1">{item.title}</h4>
                        {item.category && (
                          <p className="text-primary text-sm uppercase tracking-wider mb-1">
                            {item.category}
                          </p>
                        )}
                        {item.description && (
                          <p className="text-muted-foreground text-sm">{item.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No portfolio items yet
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
