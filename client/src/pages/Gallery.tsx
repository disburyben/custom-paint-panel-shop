import { useState } from "react";
import { motion } from "framer-motion";
import { X, User } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTeamMember, setSelectedTeamMember] = useState<number | null>(null);

  const { data: teamMembers } = trpc.team.list.useQuery();
  const { data: memberPortfolio } = trpc.team.getWithPortfolio.useQuery(
    { id: selectedTeamMember! },
    { enabled: !!selectedTeamMember }
  );

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
