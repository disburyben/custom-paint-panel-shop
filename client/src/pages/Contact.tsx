import { MapPin, Phone, Mail, Clock, Loader2 } from "lucide-react";
import { MapView } from "@/components/Map";
import QuoteWizard from "@/components/QuoteWizard";
import { trpc } from "@/lib/trpc";

export default function Contact() {
  // Fetch business info from CMS
  const { data: businessInfo, isLoading } = trpc.cms.businessInfo.get.useQuery();

  // Parse business hours
  const businessHours = businessInfo?.businessHours 
    ? JSON.parse(businessInfo.businessHours) 
    : null;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-heading font-bold text-5xl md:text-6xl uppercase mb-6">
            Get In <span className="text-primary">Touch</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Ready to start your project? Visit our shop, give us a call, or use our interactive wizard below for a free estimate.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-card border border-border p-8">
              <h3 className="font-heading font-bold text-2xl uppercase mb-6 text-primary">Contact Info</h3>
              <div className="space-y-6">
                {businessInfo?.address && (
                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-primary shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold uppercase mb-1">Visit Us</h4>
                      <p className="text-muted-foreground whitespace-pre-line">{businessInfo.address}</p>
                    </div>
                  </div>
                )}
                {businessInfo?.phone && (
                  <div className="flex items-start gap-4">
                    <Phone className="w-6 h-6 text-primary shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold uppercase mb-1">Call Us</h4>
                      <a href={`tel:${businessInfo.phone}`} className="text-muted-foreground hover:text-primary transition-colors">
                        {businessInfo.phone}
                      </a>
                    </div>
                  </div>
                )}
                {businessInfo?.email && (
                  <div className="flex items-start gap-4">
                    <Mail className="w-6 h-6 text-primary shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold uppercase mb-1">Email Us</h4>
                      <a href={`mailto:${businessInfo.email}`} className="text-muted-foreground hover:text-primary transition-colors">
                        {businessInfo.email}
                      </a>
                    </div>
                  </div>
                )}
                {businessHours && (
                  <div className="flex items-start gap-4">
                    <Clock className="w-6 h-6 text-primary shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold uppercase mb-1">Hours</h4>
                      <div className="text-muted-foreground space-y-1">
                        {Object.entries(businessHours).map(([day, hours]: [string, any]) => (
                          <p key={day}>
                            {day}: {hours.open} - {hours.close}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Map */}
            <div className="h-[300px] border border-border bg-card relative overflow-hidden grayscale hover:grayscale-0 transition-all duration-500">
               <MapView 
                className="w-full h-full"
                onMapReady={(map: google.maps.Map) => {
                  new google.maps.Marker({
                    position: { lat: -34.8333, lng: 138.6500 }, // Para Hills, SA
                    map: map,
                    title: businessInfo?.businessName || "Caspers Paintworks"
                  });
                  map.setCenter({ lat: -34.8333, lng: 138.6500 });
                  map.setZoom(14);
                }}
              />
            </div>
          </div>

          {/* Quote Wizard */}
          <div className="w-full">
            <div className="text-center mb-8 lg:hidden">
              <h2 className="font-heading font-bold text-2xl uppercase mb-2">Start Your Project</h2>
              <p className="text-sm text-muted-foreground">Use our interactive wizard to get a precise estimate.</p>
            </div>
            <QuoteWizard />
          </div>
        </div>
      </div>
    </div>
  );
}
