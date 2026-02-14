import { CheckCircle2 } from "lucide-react";

export default function About() {
  return (
    <div className="pt-24 pb-20">
      <div className="container">
        {/* Intro */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <h1 className="font-heading font-bold text-5xl md:text-6xl uppercase mb-8 leading-none">
              More Than Just <br />
              <span className="text-primary">Paint</span>
            </h1>
            <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
              <p>
                Caspers Paintworks is Adelaide's premier destination for automotive styling. Located in Roseworthy, South Australia, we started with a simple mission: to provide a level of automotive finish that exceeds factory standards.
              </p>
              <p>
                We are not just technicians; we are artists and engineers. We understand that your vehicle is an extension of your personality, a piece of history, or a high-performance machine that deserves to look as fast as it drives.
              </p>
              <p>
                Our facility combines old-school metal shaping techniques with cutting-edge paint technology. This fusion allows us to tackle everything from 1960s muscle cars to modern supercars with equal expertise.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 translate-x-4 translate-y-4" />
            <video
              src="/images/owner-painting-video.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="relative z-10 w-full border border-border grayscale hover:grayscale-0 transition-all duration-500 object-cover aspect-[4/5]"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 border-y border-border py-12">
          <div className="text-center">
            <div className="font-heading font-bold text-5xl text-primary mb-2">10+</div>
            <div className="text-sm uppercase tracking-widest text-muted-foreground">Years Experience</div>
          </div>
          <div className="text-center">
            <div className="font-heading font-bold text-5xl text-primary mb-2">200+</div>
            <div className="text-sm uppercase tracking-widest text-muted-foreground">Projects Completed</div>
          </div>
          <div className="text-center">
            <div className="font-heading font-bold text-5xl text-primary mb-2">100%</div>
            <div className="text-sm uppercase tracking-widest text-muted-foreground">Satisfaction</div>
          </div>
        </div>

        {/* Values */}
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading font-bold text-3xl uppercase mb-12 text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex gap-4">
              <CheckCircle2 className="w-8 h-8 text-primary shrink-0" />
              <div>
                <h3 className="font-heading font-bold text-xl uppercase mb-2">Uncompromising Quality</h3>
                <p className="text-muted-foreground">We don't cut corners. If a panel needs to be stripped to bare metal, we strip it. If a gap needs welding, we weld it. "Good enough" is not in our vocabulary.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="w-8 h-8 text-primary shrink-0" />
              <div>
                <h3 className="font-heading font-bold text-xl uppercase mb-2">Transparency</h3>
                <p className="text-muted-foreground">Restoration projects can be complex. We keep you informed with weekly photo updates and detailed progress reports so you're never in the dark.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="w-8 h-8 text-primary shrink-0" />
              <div>
                <h3 className="font-heading font-bold text-xl uppercase mb-2">Innovation</h3>
                <p className="text-muted-foreground">We constantly invest in the latest tools and training, from 3D scanning for part fabrication to the newest ceramic clear coats.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="w-8 h-8 text-primary shrink-0" />
              <div>
                <h3 className="font-heading font-bold text-xl uppercase mb-2">Respect</h3>
                <p className="text-muted-foreground">We treat every car as if it were our own, and every customer with the respect they deserve. Your trust is our most valuable asset.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
