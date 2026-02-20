import { MapPin, Phone, Mail, Clock } from "lucide-react";
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
                    <a href="https://maps.google.com/?q=16+Flett+Road+Roseworthy+SA" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">16 Flett Road,<br />Roseworthy, SA</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold uppercase mb-1">Call Us</h4>
                    <a href="tel:+61466254055" className="text-muted-foreground hover:text-primary transition-colors">+61 466 254 055</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold uppercase mb-1">Email Us</h4>
                    <a href="mailto:admin@casperspaintworks.com.au" className="text-muted-foreground hover:text-primary transition-colors">admin@casperspaintworks.com.au</a>
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
              <iframe
                title="Caspers Paintworks Location"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3271.5!2d138.7419!3d-34.5279!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ab7f0000000001%3A0x1!2s16+Flett+Rd%2C+Roseworthy+SA+5371!5e0!3m2!1sen!2sau!4v1"
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
