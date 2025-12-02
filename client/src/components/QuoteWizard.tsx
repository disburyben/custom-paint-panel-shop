import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Car, Truck, Bike, Wrench, Paintbrush, ShieldCheck, Upload, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "vehicle" | "service" | "details" | "contact";

const vehicleTypes = [
  { id: "sedan", label: "Sedan/Coupe", icon: Car },
  { id: "suv", label: "SUV/4x4", icon: Truck },
  { id: "ute", label: "Ute/Van", icon: Truck },
  { id: "bike", label: "Motorcycle", icon: Bike },
];

const serviceTypes = [
  { id: "respray", label: "Full Respray", icon: Paintbrush },
  { id: "restoration", label: "Restoration", icon: Wrench },
  { id: "repair", label: "Collision Repair", icon: ShieldCheck },
  { id: "custom", label: "Custom Paint", icon: Paintbrush },
];

export default function QuoteWizard() {
  const [currentStep, setCurrentStep] = useState<Step>("vehicle");
  const [formData, setFormData] = useState({
    vehicleType: "",
    serviceType: "",
    description: "",
    name: "",
    email: "",
    phone: "",
  });

  const nextStep = () => {
    const steps: Step[] = ["vehicle", "service", "details", "contact"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: Step[] = ["vehicle", "service", "details", "contact"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const updateData = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted:", formData);
    alert("Quote request submitted! We will be in touch shortly.");
  };

  const variants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-black/50 backdrop-blur-md border border-white/10 p-8 rounded-xl shadow-2xl">
      {/* Progress Bar */}
      <div className="flex justify-between mb-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-10" />
        {["vehicle", "service", "details", "contact"].map((step, index) => {
          const steps: Step[] = ["vehicle", "service", "details", "contact"];
          const isActive = steps.indexOf(currentStep) >= index;
          return (
            <div key={step} className="flex flex-col items-center gap-2 bg-black px-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors duration-300",
                  isActive
                    ? "border-white bg-white text-black"
                    : "border-white/20 bg-black text-white/50"
                )}
              >
                {index + 1}
              </div>
              <span className="text-[10px] uppercase tracking-widest text-white/50 hidden sm:block">
                {step}
              </span>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="min-h-[400px] flex flex-col">
        <AnimatePresence mode="wait">
          {currentStep === "vehicle" && (
            <motion.div
              key="vehicle"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              <h2 className="text-2xl font-heading font-bold text-white mb-6 uppercase">Select Vehicle Type</h2>
              <div className="grid grid-cols-2 gap-4">
                {vehicleTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => updateData("vehicleType", type.id)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-4 p-6 border rounded-lg transition-all duration-300 hover:bg-white/5",
                      formData.vehicleType === type.id
                        ? "border-white bg-white/10 text-white"
                        : "border-white/10 text-white/50 hover:border-white/30"
                    )}
                  >
                    <type.icon className="w-10 h-10" />
                    <span className="font-heading uppercase tracking-wider text-sm">{type.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {currentStep === "service" && (
            <motion.div
              key="service"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              <h2 className="text-2xl font-heading font-bold text-white mb-6 uppercase">Select Service Required</h2>
              <div className="grid grid-cols-2 gap-4">
                {serviceTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => updateData("serviceType", type.id)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-4 p-6 border rounded-lg transition-all duration-300 hover:bg-white/5",
                      formData.serviceType === type.id
                        ? "border-white bg-white/10 text-white"
                        : "border-white/10 text-white/50 hover:border-white/30"
                    )}
                  >
                    <type.icon className="w-10 h-10" />
                    <span className="font-heading uppercase tracking-wider text-sm">{type.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {currentStep === "details" && (
            <motion.div
              key="details"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              <h2 className="text-2xl font-heading font-bold text-white mb-6 uppercase">Project Details</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">Tell us about your project</Label>
                  <Textarea
                    id="description"
                    placeholder="Year, make, model, and specific requirements..."
                    className="min-h-[150px] bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/50"
                    value={formData.description}
                    onChange={(e) => updateData("description", e.target.value)}
                  />
                </div>
                
                <div className="border-2 border-dashed border-white/10 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:border-white/30 transition-colors cursor-pointer bg-white/5">
                  <Upload className="w-8 h-8 text-white/50 mb-4" />
                  <p className="text-sm text-white font-medium">Upload Photos</p>
                  <p className="text-xs text-white/50 mt-1">Drag & drop or click to browse</p>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === "contact" && (
            <motion.div
              key="contact"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              <h2 className="text-2xl font-heading font-bold text-white mb-6 uppercase">Contact Information</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Full Name</Label>
                  <Input
                    id="name"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/50"
                    value={formData.name}
                    onChange={(e) => updateData("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/50"
                    value={formData.email}
                    onChange={(e) => updateData("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/50"
                    value={formData.phone}
                    onChange={(e) => updateData("phone", e.target.value)}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between mt-8 pt-8 border-t border-white/10">
          <Button
            type="button"
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === "vehicle"}
            className="text-white/50 hover:text-white hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          
          {currentStep === "contact" ? (
            <Button type="submit" className="bg-white text-black hover:bg-white/90">
              Submit Request <Check className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={nextStep}
              className="bg-white text-black hover:bg-white/90"
              disabled={
                (currentStep === "vehicle" && !formData.vehicleType) ||
                (currentStep === "service" && !formData.serviceType)
              }
            >
              Next Step <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
