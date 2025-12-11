import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function Services() {
  const { data: services = [], isLoading } = trpc.cms.services.getAll.useQuery();

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

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No services available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service: any) => {
              const features = service.features ? JSON.parse(service.features) : [];
              return (
                <div key={service.id} className="bg-card border border-border p-8 hover:border-primary/50 transition-all duration-300 group hover:-translate-y-2">
                  {service.imageUrl && (
                    <div className="mb-6 p-4 bg-background border border-border w-fit group-hover:shadow-[0_0_20px_var(--primary)] transition-shadow duration-300">
                      <img 
                        src={service.imageUrl} 
                        alt={service.name}
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                  )}
                  <h3 className="font-heading font-bold text-2xl uppercase mb-4 group-hover:text-primary transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                    {service.shortDescription || service.description}
                  </p>
                  
                  {features.length > 0 && (
                    <ul className="space-y-2 mb-6">
                      {features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-center text-sm font-medium">
                          <div className="w-1.5 h-1.5 bg-primary mr-3" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}

                  {service.priceDescription && (
                    <p className="text-primary font-semibold text-sm">
                      {service.priceDescription}
                    </p>
                  )}

                  {service.turnaroundTime && (
                    <p className="text-muted-foreground text-xs mt-2">
                      Turnaround: {service.turnaroundTime}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

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
