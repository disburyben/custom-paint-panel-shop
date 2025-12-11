import { Button } from "@/components/ui/button";
import { Paintbrush, Wrench, ShieldCheck, Car, SprayCan, Hammer } from "lucide-react";
import { Link } from "wouter";

export default function Services() {
  const services = [
    {
      icon: <Paintbrush className="w-12 h-12 text-primary" />,
      title: "Custom Paint",
      description: "High-end custom finishes including candy, pearl, flake, and matte options. We use premium materials for show-quality results.",
      features: ["Color Matching", "Custom Graphics", "Matte Finishes", "Candy & Pearls"]
    },
    {
      icon: <Wrench className="w-12 h-12 text-primary" />,
      title: "Restoration",
      description: "Complete frame-off restorations for classic cars and muscle cars. We handle everything from rust repair to final assembly.",
      features: ["Rust Repair", "Metal Fabrication", "Frame Straightening", "Parts Sourcing"]
    },
    {
      icon: <ShieldCheck className="w-12 h-12 text-primary" />,
      title: "Collision Repair",
      description: "Accident damage repair for all makes and models. We work with all insurance companies to get you back on the road safely.",
      features: ["Dent Removal", "Bumper Repair", "Structural Repair", "Insurance Claims"]
    },
    {
      icon: <Car className="w-12 h-12 text-primary" />,
      title: "Detailing & Protection",
      description: "Protect your investment with ceramic coatings and paint protection film (PPF). Keep your paint looking new for years.",
      features: ["Ceramic Coating", "Paint Correction", "PPF Installation", "Interior Detailing"]
    },
    {
      icon: <SprayCan className="w-12 h-12 text-primary" />,
      title: "Resprays",
      description: "Full vehicle color changes or closed-door resprays to refresh your vehicle's appearance.",
      features: ["OEM Colors", "Color Changes", "Closed Door", "Engine Bay"]
    },
    {
      icon: <Hammer className="w-12 h-12 text-primary" />,
      title: "Panel Beating",
      description: "Expert metal shaping and panel beating to restore body lines and gaps to factory (or better) standards.",
      features: ["Dent Pulling", "File Finishing", "Gap Alignment", "Lead Loading"]
    }
  ];

  return (
    <div className="pt-24 pb-20">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="font-heading font-bold text-5xl md:text-6xl uppercase mb-6">
            Our <span className="text-primary">Services</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            We offer a comprehensive range of automotive aesthetic and structural services. 
            Every job is treated with the same level of care and precision, regardless of size.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-card border border-border p-8 hover:border-primary/50 transition-all duration-300 group hover:-translate-y-2">
              <div className="mb-6 p-4 bg-background border border-border w-fit group-hover:shadow-[0_0_20px_var(--primary)] transition-shadow duration-300">
                {service.icon}
              </div>
              <h3 className="font-heading font-bold text-2xl uppercase mb-4 group-hover:text-primary transition-colors">
                {service.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                {service.description}
              </p>
              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm font-medium">
                    <div className="w-1.5 h-1.5 bg-primary mr-3" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center bg-card border border-border p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 skew-x-[-20deg] translate-x-1/2" />
          <div className="relative z-10">
            <h2 className="font-heading font-bold text-3xl uppercase mb-4">Need something specific?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              We love custom challenges. If you have a unique project in mind that isn't listed here, get in touch with us.
            </p>
            <Link href="/contact">
              <Button size="lg" className="skew-x-[-10deg] font-heading uppercase tracking-wider">
                <span className="skew-x-[10deg]">Contact Us Today</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
