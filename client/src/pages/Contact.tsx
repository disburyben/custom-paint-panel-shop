import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { MapView } from "@/components/Map";
import QuoteWizard from "@/components/QuoteWizard";

export default function Contact() {
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
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold uppercase mb-1">Visit Us</h4>
                    <p className="text-muted-foreground">Para Hills<br />Adelaide, South Australia</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold uppercase mb-1">Call Us</h4>
                    <p className="text-muted-foreground">(555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold uppercase mb-1">Email Us</h4>
                    <p className="text-muted-foreground">enquiries@casperspaintworks.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold uppercase mb-1">Hours</h4>
                    <p className="text-muted-foreground">Mon - Fri: 8:00 AM - 6:00 PM</p>
                    <p className="text-muted-foreground">Sat: 9:00 AM - 2:00 PM</p>
                    <p className="text-muted-foreground">Sun: Closed</p>
                  </div>
                </div>
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
                    title: "Caspers Paintworks"
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
