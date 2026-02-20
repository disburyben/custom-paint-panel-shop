import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Car, Truck, Bike, Wrench, Paintbrush, ShieldCheck, Upload, Check, ArrowRight, ArrowLeft, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Step = "vehicle" | "service" | "details" | "contact";

const vehicleTypes = [
  { id: "car", label: "Sedan/Coupe", icon: Car },
  { id: "suv", label: "SUV/4x4", icon: Truck },
  { id: "truck", label: "Ute/Van", icon: Truck },
  { id: "motorcycle", label: "Motorcycle", icon: Bike },
];

const serviceTypes = [
  { id: "custom-paint", label: "Full Respray", icon: Paintbrush },
  { id: "restoration", label: "Restoration", icon: Wrench },
  { id: "collision-repair", label: "Collision Repair", icon: ShieldCheck },
  { id: "detailing", label: "Custom Paint", icon: Paintbrush },
];

interface UploadedFile {
  fileName: string;
  fileType: string;
  fileData: string; // base64
  preview: string;
}

export default function QuoteWizard() {
  const [currentStep, setCurrentStep] = useState<Step>("vehicle");
  const [submitted, setSubmitted] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    vehicleType: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    serviceType: "",
    paintFinish: "",
    description: "",
    budget: "",
    timeline: "",
    name: "",
    email: "",
    phone: "",
  });

  const submitQuote = trpc.quotes.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setFormData({
        vehicleType: "",
        vehicleMake: "",
        vehicleModel: "",
        vehicleYear: "",
        serviceType: "",
        paintFinish: "",
        description: "",
        budget: "",
        timeline: "",
        name: "",
        email: "",
        phone: "",
      });
      setUploadedFiles([]);
      setCurrentStep("vehicle");
    },
    onError: (error) => {
      toast.error(`Failed to submit quote: ${error.message}`);
    },
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum size is 5MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setUploadedFiles((prev) => [
          ...prev,
          {
            fileName: file.name,
            fileType: file.type,
            fileData: base64,
            preview: base64,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    submitQuote.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      vehicleType: formData.vehicleType,
      vehicleMake: formData.vehicleMake || undefined,
      vehicleModel: formData.vehicleModel || undefined,
      vehicleYear: formData.vehicleYear || undefined,
      serviceType: formData.serviceType,
      paintFinish: formData.paintFinish || undefined,
      description: formData.description || undefined,
      budget: formData.budget || undefined,
      timeline: formData.timeline || undefined,
      files: uploadedFiles.length > 0 ? uploadedFiles : undefined,
    });
  };

  const variants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  };

  if (submitted) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-black/50 backdrop-blur-md border border-white/10 p-12 rounded-xl shadow-2xl text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-3xl font-heading font-bold text-white uppercase mb-4">Request Received!</h2>
        <p className="text-white/70 text-lg mb-2">Thanks, we've got your quote request.</p>
        <p className="text-white/50 mb-8">We'll be in touch within 1–2 business days with your personalised quote.</p>
        <Button
          onClick={() => setSubmitted(false)}
          className="bg-white text-black hover:bg-white/90"
        >
          Submit Another Request
        </Button>
      </div>
    );
  }

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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleMake" className="text-white text-xs">Make</Label>
                    <Input
                      id="vehicleMake"
                      placeholder="e.g., Ford"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/50"
                      value={formData.vehicleMake}
                      onChange={(e) => updateData("vehicleMake", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleModel" className="text-white text-xs">Model</Label>
                    <Input
                      id="vehicleModel"
                      placeholder="e.g., Mustang"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/50"
                      value={formData.vehicleModel}
                      onChange={(e) => updateData("vehicleModel", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">Tell us about your project</Label>
                  <Textarea
                    id="description"
                    placeholder="Specific requirements, color preferences, timeline..."
                    className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/50"
                    value={formData.description}
                    onChange={(e) => updateData("description", e.target.value)}
                  />
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/10 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-white/30 transition-colors cursor-pointer bg-white/5"
                  >
                    <Upload className="w-8 h-8 text-white/50 mb-2" />
                    <p className="text-sm text-white font-medium">Upload Photos</p>
                    <p className="text-xs text-white/50 mt-1">Click to browse (max 5MB each)</p>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={file.preview}
                            alt={file.fileName}
                            className="w-full h-20 object-cover rounded border border-white/10"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
                  <Label htmlFor="name" className="text-white">Full Name *</Label>
                  <Input
                    id="name"
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/50"
                    value={formData.name}
                    onChange={(e) => updateData("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
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
            disabled={currentStep === "vehicle" || submitQuote.isPending}
            className="text-white/50 hover:text-white hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          {currentStep === "contact" ? (
            <Button
              type="submit"
              className="bg-white text-black hover:bg-white/90"
              disabled={submitQuote.isPending}
            >
              {submitQuote.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  Submit Request <Check className="w-4 h-4 ml-2" />
                </>
              )}
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
