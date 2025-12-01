import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { MapView } from "@/components/Map";

type ContactForm = {
  name: string;
  email: string;
  phone: string;
  vehicle: string;
  message: string;
};

export default function Contact() {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<ContactForm>();

  const onSubmit = async (data: ContactForm) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(data);
    toast.success("Message sent successfully! We'll be in touch shortly.");
    reset();
  };

  return (
    <div className="pt-24 pb-20">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-heading font-bold text-5xl md:text-6xl uppercase mb-6">
            Get In <span className="text-primary">Touch</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Ready to start your project? Visit our shop, give us a call, or fill out the form below for a free estimate.
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
                    <p className="text-muted-foreground">123 Auto Avenue<br />Motor City, MC 90210</p>
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
                    <p className="text-muted-foreground">info@custompaint.com</p>
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
                    position: { lat: 34.0522, lng: -118.2437 }, // Example coordinates (LA)
                    map: map,
                    title: "Custom Paint & Panel Shop"
                  });
                  map.setCenter({ lat: 34.0522, lng: -118.2437 });
                  map.setZoom(14);
                }}
              />
            </div>
          </div>

          {/* Form */}
          <div className="bg-card border border-border p-8 lg:p-12">
            <h3 className="font-heading font-bold text-2xl uppercase mb-8 text-primary">Send a Message</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider">Name</label>
                  <Input {...register("name", { required: true })} placeholder="John Doe" className="bg-background border-border focus:border-primary rounded-none h-12" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider">Email</label>
                  <Input {...register("email", { required: true })} type="email" placeholder="john@example.com" className="bg-background border-border focus:border-primary rounded-none h-12" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider">Phone</label>
                  <Input {...register("phone", { required: true })} placeholder="(555) 123-4567" className="bg-background border-border focus:border-primary rounded-none h-12" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider">Vehicle Info</label>
                  <Input {...register("vehicle")} placeholder="Year, Make, Model" className="bg-background border-border focus:border-primary rounded-none h-12" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider">Message</label>
                <Textarea {...register("message", { required: true })} placeholder="Tell us about your project..." className="bg-background border-border focus:border-primary rounded-none min-h-[150px]" />
              </div>

              <Button type="submit" disabled={isSubmitting} size="lg" className="w-full h-14 skew-x-[-10deg] font-heading uppercase tracking-widest text-lg">
                <span className="skew-x-[10deg]">
                  {isSubmitting ? "Sending..." : "Send Message"}
                </span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
