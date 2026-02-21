import { useState } from "react";
import { motion } from "framer-motion";
import { X, User, ChevronLeft, ChevronRight, Images } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function toDirectUrl(url: string) {
  return url
    .replace("www.dropbox.com", "dl.dropboxusercontent.com")
    .replace(/[?&]dl=0/, "")
    .replace(/[?&]dl=1/, "");
}

function parseImages(raw: string): string[] {
  try { return JSON.parse(raw); } catch { return []; }
}

const CATEGORY_LABELS: Record<string, string> = {
  "all": "All",
  "custom-paint": "Custom Paint",
  "restoration": "Restoration",
  "collision-repair": "Collision Repair",
  "detailing": "Detailing",
  "other": "Other",
};

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTeamMember, setSelectedTeamMember] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number; title: string } | null>(null);

  const { data: teamMembers } = trpc.team.list.useQuery();
  const { data: memberPortfolio } = trpc.team.getWithPortfolio.useQuery(
    { id: selectedTeamMember! },
    { enabled: !!selectedTeamMember }
  );
  const { data: allAlbums = [] } = trpc.cms.gallery.getAll.useQuery();

  const filteredAlbums = activeCategory === "all"
    ? allAlbums
    : allAlbums.filter((a: any) => a.category === activeCategory);

  const albumCategories = ["all", ...Array.from(new Set(allAlbums.map((a: any) => a.category as string)))];

  const prevPhoto = () => lightbox && setLightbox({ ...lightbox, index: (lightbox.index - 1 + lightbox.images.length) % lightbox.images.length });
  const nextPhoto = () => lightbox && setLightbox({ ...lightbox, index: (lightbox.index + 1) % lightbox.images.length });

  return (
    <div className="pt-24 pb-20">
      <div className="container">

        {/* Gallery Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-heading font-bold text-5xl md:text-6xl uppercase mb-6">
            Project <span className="text-primary">Gallery</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            A showcase of our finest work — custom paint jobs, restorations, project cars and more.
          </p>
        </div>

        {/* ── CMS Albums ── */}
        {allAlbums.length > 0 && (
          <div className="mb-20">
            {/* Category filter pills */}
            {albumCategories.length > 2 && (
              <div className="flex flex-wrap gap-2 justify-center mb-10">
                {albumCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                  >
                    {CATEGORY_LABELS[cat] ?? cat}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAlbums.map((album: any) => {
                const imgs = parseImages(album.images);
                const cover = album.coverImageUrl || imgs[0];
                return (
                  <motion.div
                    key={album.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group rounded-xl overflow-hidden border border-border cursor-pointer hover:border-primary/60 hover:shadow-lg transition-all duration-300 bg-card"
                    onClick={() => imgs.length > 0 && setLightbox({ images: imgs, index: 0, title: album.title })}
                  >
                    {/* Photo preview */}
                    {imgs.length === 0 ? (
                      <div className="h-52 bg-muted flex items-center justify-center">
                        <Images className="w-10 h-10 text-muted-foreground/30" />
                      </div>
                    ) : imgs.length === 1 ? (
                      <img
                        src={toDirectUrl(cover!)}
                        alt={album.title}
                        className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className={`grid h-52 gap-0.5 ${imgs.length >= 4 ? "grid-cols-2 grid-rows-2" : "grid-cols-2"}`}>
                        {imgs.slice(0, 4).map((u: string, i: number) => (
                          <div key={i} className="relative overflow-hidden">
                            <img src={toDirectUrl(u)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            {i === 3 && imgs.length > 4 && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-white font-bold text-xl">+{imgs.length - 4}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="p-4">
                      <h2 className="font-heading font-bold text-xl uppercase mb-1 group-hover:text-primary transition-colors">{album.title}</h2>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{CATEGORY_LABELS[album.category] ?? album.category}</span>
                        <span>·</span>
                        <span>{imgs.length} photo{imgs.length !== 1 ? "s" : ""}</span>
                      </div>
                      {album.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{album.description}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Team Showcase ── */}
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
                    <h3 className="font-heading font-bold text-2xl uppercase mb-1 group-hover:text-primary transition-colors">{member.name}</h3>
                    <p className="text-primary text-sm uppercase tracking-wider mb-2">{member.title}</p>
                    {member.specialty && <p className="text-muted-foreground text-sm">{member.specialty}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Album Lightbox ── */}
      {lightbox && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors" onClick={() => setLightbox(null)}>
            <X className="w-6 h-6" />
          </button>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium">
            {lightbox.title} · {lightbox.index + 1} / {lightbox.images.length}
          </div>
          {lightbox.images.length > 1 && (
            <button className="absolute left-3 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors" onClick={(e) => { e.stopPropagation(); prevPhoto(); }}>
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}
          <img
            src={toDirectUrl(lightbox.images[lightbox.index])}
            alt=""
            className="max-h-[82vh] max-w-[88vw] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          {lightbox.images.length > 1 && (
            <button className="absolute right-3 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors" onClick={(e) => { e.stopPropagation(); nextPhoto(); }}>
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
          {lightbox.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 max-w-[90vw] overflow-x-auto pb-1">
              {lightbox.images.map((u, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setLightbox({ ...lightbox, index: i }); }}
                  className={`shrink-0 w-14 h-10 rounded overflow-hidden border-2 transition-colors ${i === lightbox.index ? "border-primary" : "border-transparent opacity-50 hover:opacity-90"}`}>
                  <img src={toDirectUrl(u)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Simple image lightbox (for team portfolio) ── */}
      {selectedImage && (
        <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-6 right-6 text-white hover:text-primary transition-colors" onClick={() => setSelectedImage(null)}>
            <X className="w-10 h-10" />
          </button>
          <img src={selectedImage} alt="Gallery Preview" className="max-w-full max-h-full object-contain shadow-2xl border border-border" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* ── Team Member Portfolio Dialog ── */}
      <Dialog open={!!selectedTeamMember} onOpenChange={() => setSelectedTeamMember(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-background">
          {memberPortfolio && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-6 mb-4">
                  {memberPortfolio.member.headshotUrl && (
                    <img src={memberPortfolio.member.headshotUrl} alt={memberPortfolio.member.name} className="w-24 h-24 rounded-full object-cover border-2 border-primary" />
                  )}
                  <div>
                    <DialogTitle className="font-heading text-3xl uppercase mb-1">{memberPortfolio.member.name}</DialogTitle>
                    <p className="text-primary uppercase tracking-wider text-sm">{memberPortfolio.member.title}</p>
                    {memberPortfolio.member.specialty && <p className="text-muted-foreground text-sm mt-1">{memberPortfolio.member.specialty}</p>}
                  </div>
                </div>
                {memberPortfolio.member.bio && <p className="text-muted-foreground">{memberPortfolio.member.bio}</p>}
              </DialogHeader>

              <div className="mt-6">
                <h3 className="font-heading font-bold text-2xl uppercase mb-6">Portfolio <span className="text-primary">({memberPortfolio.portfolio.length})</span></h3>
                {memberPortfolio.portfolio.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {memberPortfolio.portfolio.map((item) => (
                      <div key={item.id} className="group">
                        <div className="relative aspect-[4/3] overflow-hidden border border-border bg-card mb-3 cursor-pointer" onClick={() => setSelectedImage(item.imageUrl)}>
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          {item.isFeatured === 1 && <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 uppercase">Featured</div>}
                        </div>
                        <h4 className="font-heading font-bold uppercase mb-1">{item.title}</h4>
                        {item.category && <p className="text-primary text-sm uppercase tracking-wider mb-1">{item.category}</p>}
                        {item.description && <p className="text-muted-foreground text-sm">{item.description}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">No portfolio items yet</div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
