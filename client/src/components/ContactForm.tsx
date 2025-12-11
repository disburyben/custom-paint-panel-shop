import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const submitContact = trpc.contact.submit.useMutation({
    onSuccess: () => {
      toast.success("Thank you! Your message has been sent successfully.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    },
    onError: (error) => {
      toast.error(`Failed to send message: ${error.message}`);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitContact.mutate(formData);
  };

  if (submitted) {
    return (
      <div className="bg-card border border-border p-8 text-center rounded-lg">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h3 className="font-heading font-bold text-2xl uppercase mb-2">Message Sent!</h3>
        <p className="text-muted-foreground">
          Thank you for reaching out. We'll get back to you as soon as possible.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name" className="text-sm font-semibold uppercase">
            Name *
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
            required
            minLength={2}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="email" className="text-sm font-semibold uppercase">
            Email *
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            required
            className="mt-2"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="phone" className="text-sm font-semibold uppercase">
          Phone
        </Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="(08) 1234 5678"
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="subject" className="text-sm font-semibold uppercase">
          Subject *
        </Label>
        <Input
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="What is this about?"
          required
          minLength={5}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="message" className="text-sm font-semibold uppercase">
          Message *
        </Label>
        <Textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Tell us more about your inquiry..."
          required
          minLength={10}
          rows={6}
          className="mt-2"
        />
      </div>

      <Button
        type="submit"
        disabled={submitContact.isPending}
        className="w-full skew-x-[-10deg] font-heading uppercase tracking-wider hover:shadow-[0_0_20px_var(--primary)] transition-all duration-300"
      >
        {submitContact.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span className="skew-x-[10deg]">Sending...</span>
          </>
        ) : (
          <span className="skew-x-[10deg]">Send Message</span>
        )}
      </Button>

      {submitContact.isError && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-500 font-semibold">Error</p>
            <p className="text-sm text-red-500/80">{submitContact.error?.message}</p>
          </div>
        </div>
      )}
    </form>
  );
}
