import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Star, Wrench, ShieldCheck, Paintbrush, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import ProcessTimeline from "@/components/ProcessTimeline";
import { trpc } from "@/lib/trpc";

export default function Home() {
  // Fetch testimonials and blog posts from CMS
  const { data: testimonials = [] } = trpc.cms.testimonials.getAll.useQuery();
  const { data: blogPosts = [] } = trpc.cms.blog.getAll.useQuery();

  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[800px] flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
<div className="absolute inset-0 z-0">
        <video 
          src="/images/owner-painting-video.mp4" 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
      </div>

        <div className="container relative z-10 pt-20">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-3xl"
          >
            <motion.div variants={fadeIn} className="flex items-center gap-4 mb-6">
              <div className="h-[2px] w-12 bg-primary" />
              <span className="text-primary font-heading font-bold uppercase tracking-[0.3em] text-sm">
                Premium Automotive Styling
              </span>
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="font-heading font-bold text-6xl md:text-8xl uppercase leading-[0.9] mb-8 text-white drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              Precision <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">Meets</span> <br />
              Passion
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-lg md:text-xl text-gray-300 mb-10 max-w-xl font-light leading-relaxed border-l-2 border-primary/50 pl-6">
              Transform your vehicle into a masterpiece. We specialize in high-end custom paint, collision repair, and classic restoration with showroom-quality finishes.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-wrap gap-6">
              <Link href="/contact">
                <Button size="lg" className="h-14 px-8 text-lg skew-x-[-10deg] hover:shadow-[0_0_30px_var(--primary)] transition-all duration-300 border-none bg-primary text-primary-foreground">
                  <span className="skew-x-[10deg] flex items-center gap-2">
                    Start Your Project <ArrowRight className="w-5 h-5" />
                  </span>
                </Button>
              </Link>
              <Link href="/gallery">
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg skew-x-[-10deg] border-white/20 text-white hover:bg-white/10 hover:text-white hover:border-white/50 backdrop-blur-sm">
                  <span className="skew-x-[10deg]">View Gallery</span>
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] font-heading">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-primary to-transparent" />
        </motion.div>
      </section>

    {/* Process Timeline */}
      <ProcessTimeline />

      {/* Services Section */}
      <section className="py-20 bg-black relative overflow-hidden">        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="font-heading font-bold text-4xl md:text-5xl uppercase mb-4">
                Our <span className="text-primary">Expertise</span>
              </h2>
              <p className="text-muted-foreground max-w-md">
                Comprehensive automotive aesthetic solutions delivered with surgical precision.
              </p>
            </div>
            <Link href="/services">
              <Button variant="link" className="text-primary p-0 h-auto font-heading uppercase tracking-widest hover:text-white group">
                View All Services <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service Card 1 */}
            <div className="group relative h-[500px] overflow-hidden border border-border bg-card hover:border-primary/50 transition-colors duration-500">
              <div className="absolute inset-0">
                <img src="/images/service-paint.jpg" alt="Custom Paint" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 w-full p-8">
                <Paintbrush className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-heading font-bold text-2xl uppercase mb-2 group-hover:text-primary transition-colors">Custom Paint</h3>
                <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
                  From candy pearls to matte finishes, our state-of-the-art booth delivers flawless, dust-free application for show-winning results.
                </p>
                <span className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-white group-hover:translate-x-2 transition-transform duration-300">
                  Learn More <ArrowRight className="w-3 h-3 ml-2 text-primary" />
                </span>
              </div>
            </div>

            {/* Service Card 2 */}
            <div className="group relative h-[500px] overflow-hidden border border-border bg-card hover:border-primary/50 transition-colors duration-500">
              <div className="absolute inset-0">
                <img src="/images/service-restoration.jpg" alt="Restoration" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 w-full p-8">
                <Wrench className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-heading font-bold text-2xl uppercase mb-2 group-hover:text-primary transition-colors">Restoration</h3>
                <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
                  Full rotisserie restorations for classics and muscle cars. We bring history back to life with modern durability and period-correct details.
                </p>
                <span className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-white group-hover:translate-x-2 transition-transform duration-300">
                  Learn More <ArrowRight className="w-3 h-3 ml-2 text-primary" />
                </span>
              </div>
            </div>

            {/* Service Card 3 */}
            <div className="group relative h-[500px] overflow-hidden border border-border bg-card hover:border-primary/50 transition-colors duration-500">
              <div className="absolute inset-0">
                <img src="/images/feature-detail.jpg" alt="Collision Repair" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 w-full p-8">
                <ShieldCheck className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-heading font-bold text-2xl uppercase mb-2 group-hover:text-primary transition-colors">Collision Repair</h3>
                <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
                  Insurance-approved structural repairs using factory specifications. We erase the accident and restore safety and value.
                </p>
                <span className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-white group-hover:translate-x-2 transition-transform duration-300">
                  Learn More <ArrowRight className="w-3 h-3 ml-2 text-primary" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us / About Teaser */}
      <section className="py-24 bg-card relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 skew-x-[-20deg] translate-x-20" />
        
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -inset-4 border border-primary/30 translate-x-4 translate-y-4 z-0" />
              <img src="/images/about-workshop.jpg" alt="Our Workshop" className="relative z-10 w-full shadow-2xl grayscale hover:grayscale-0 transition-all duration-700" />
              <div className="absolute -bottom-6 -right-6 bg-background border border-border p-4 shadow-xl z-20 w-[300px]">
                <BeforeAfterSlider 
                  beforeImage="/images/engine-bay-prep-1.jpg"
                  afterImage="/images/engine-bay-paint-1.jpg"
                  alt="Engine Bay Restoration"
                />
                <div className="mt-2 text-center">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Drag to Compare</p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="font-heading font-bold text-4xl md:text-5xl uppercase mb-8">
                The <span className="text-primary">Standard</span> <br />
                We Set
              </h2>
              
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-background border border-border flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-xl uppercase mb-2">Factory-Match Precision</h4>
                    <p className="text-muted-foreground text-sm">Using computerized color matching technology to ensure invisible repairs and seamless blends.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-background border border-border flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-xl uppercase mb-2">Lifetime Warranty</h4>
                    <p className="text-muted-foreground text-sm">We stand behind our craftsmanship. All paint work comes with a lifetime guarantee against peeling or fading.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-background border border-border flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-xl uppercase mb-2">Eco-Friendly Systems</h4>
                    <p className="text-muted-foreground text-sm">Utilizing advanced waterborne paint systems that reduce VOC emissions without compromising quality.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-10">
                <Link href="/about">
                  <Button variant="outline" className="skew-x-[-10deg] border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    <span className="skew-x-[10deg]">More About Us</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials / Trust */}
      <section className="py-20 bg-background border-y border-border/50">
        <div className="container text-center">
          <h2 className="font-heading font-bold text-3xl uppercase mb-12 tracking-widest">Trusted By Enthusiasts</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.length > 0 ? (
              testimonials.slice(0, 3).map((testimonial: any) => (
                <div key={testimonial.id} className="bg-card p-8 border border-border relative group hover:-translate-y-2 transition-transform duration-300">
                  <div className="flex justify-center gap-1 mb-6">
                    {[...Array(testimonial.rating || 5)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 text-primary fill-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic mb-6 text-sm leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div className="font-heading font-bold uppercase text-sm">
                    {testimonial.customerName}
                  </div>
                  {testimonial.customerTitle && (
                    <div className="text-xs text-primary mt-1 uppercase tracking-wider">
                      {testimonial.customerTitle}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-3 text-muted-foreground">No testimonials available yet.</div>
            )}
          </div>
        </div>
      </section>

      {/* Latest Blog Posts */}
      {blogPosts.length > 0 && (
        <section className="py-24 bg-card relative overflow-hidden">
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div>
                <h2 className="font-heading font-bold text-4xl md:text-5xl uppercase mb-4">
                  Latest <span className="text-primary">Insights</span>
                </h2>
                <p className="text-muted-foreground max-w-md">
                  Tips, trends, and stories from the automotive refinishing world.
                </p>
              </div>
              <Link href="/blog">
                <Button variant="link" className="text-primary p-0 h-auto font-heading uppercase tracking-widest hover:text-white group">
                  View All Articles <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogPosts.slice(0, 3).map((post: any) => {
                const publishDate = new Date(post.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                });
                return (
                  <Link key={post.id} href={`/blog/${post.slug}`}>
                    <a className="group">
                      <div className="bg-background border border-border p-6 h-full flex flex-col hover:border-primary transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-primary font-semibold text-xs uppercase tracking-wider">
                            {post.category}
                          </span>
                          <span className="text-muted-foreground text-xs">{publishDate}</span>
                        </div>
                        <h3 className="font-heading font-bold text-lg uppercase mb-3 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground text-sm flex-grow line-clamp-3 mb-4">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all">
                          Read More
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </a>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-primary/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] opacity-20" />
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
        
        <div className="container relative z-10 text-center max-w-3xl">
          <h2 className="font-heading font-bold text-5xl md:text-7xl uppercase mb-6 leading-none">
            Ready to <span className="text-primary">Shine?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-10 font-light">
            Book your consultation today and let's discuss how we can take your vehicle to the next level.
          </p>
          <Link href="/contact">
            <Button size="lg" className="h-16 px-12 text-xl skew-x-[-10deg] shadow-[0_0_40px_var(--primary)] hover:shadow-[0_0_60px_var(--primary)] hover:scale-105 transition-all duration-300 bg-primary text-primary-foreground border-none">
              <span className="skew-x-[10deg] font-bold uppercase tracking-widest">Get Your Free Quote</span>
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
