import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function BusinessInfoManager() {
  const [formData, setFormData] = useState({
    businessName: "",
    phone: "",
    email: "",
    address: "",
    businessHours: {} as Record<string, { open: string; close: string }>,
    instagram: "",
    facebook: "",
    twitter: "",
    youtube: "",
    aboutText: "",
    mission: "",
    yearsInBusiness: "",
    projectsCompleted: "",
    satisfactionRate: "",
  });

  const utils = trpc.useUtils();

  // Fetch business info
  const { data: businessInfo, isLoading } = trpc.cms.businessInfo.get.useQuery();

  // Update business info
  const updateMutation = trpc.cms.businessInfo.update.useMutation({
    onSuccess: () => {
      toast.success("Business information updated successfully");
      utils.cms.businessInfo.get.invalidate();
    },
    onError: (error) => {
      toast.error(`Error updating business info: ${error.message}`);
    },
  });

  // Load data when fetched
  useEffect(() => {
    if (businessInfo) {
      setFormData({
        businessName: businessInfo.businessName || "",
        phone: businessInfo.phone || "",
        email: businessInfo.email || "",
        address: businessInfo.address || "",
        businessHours: businessInfo.businessHours
          ? JSON.parse(businessInfo.businessHours)
          : {},
        instagram: businessInfo.instagram || "",
        facebook: businessInfo.facebook || "",
        twitter: businessInfo.twitter || "",
        youtube: businessInfo.youtube || "",
        aboutText: businessInfo.aboutText || "",
        mission: businessInfo.mission || "",
        yearsInBusiness: businessInfo.yearsInBusiness?.toString() || "",
        projectsCompleted: businessInfo.projectsCompleted?.toString() || "",
        satisfactionRate: businessInfo.satisfactionRate?.toString() || "",
      });
    }
  }, [businessInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.businessName || !formData.phone || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    updateMutation.mutate({
      businessName: formData.businessName,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      businessHours: formData.businessHours,
      instagram: formData.instagram,
      facebook: formData.facebook,
      twitter: formData.twitter,
      youtube: formData.youtube,
      aboutText: formData.aboutText,
      mission: formData.mission,
      yearsInBusiness: formData.yearsInBusiness ? parseInt(formData.yearsInBusiness) : undefined,
      projectsCompleted: formData.projectsCompleted ? parseInt(formData.projectsCompleted) : undefined,
      satisfactionRate: formData.satisfactionRate ? parseInt(formData.satisfactionRate) : undefined,
    });
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  if (isLoading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Business Information</h1>
        <p className="text-muted-foreground">Update your contact details, hours, and social media</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Information */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Business Name *</label>
              <Input
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="Your business name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Your business address"
                rows={3}
              />
            </div>
          </div>
        </Card>

        {/* Business Hours */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Business Hours</h2>
          <div className="space-y-3">
            {days.map((day) => (
              <div key={day} className="grid grid-cols-3 gap-4 items-center">
                <label className="text-sm font-medium">{day}</label>
                <Input
                  type="time"
                  value={
                    formData.businessHours[day]?.open || "09:00"
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      businessHours: {
                        ...formData.businessHours,
                        [day]: {
                          ...formData.businessHours[day],
                          open: e.target.value,
                        },
                      },
                    })
                  }
                />
                <Input
                  type="time"
                  value={
                    formData.businessHours[day]?.close || "17:00"
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      businessHours: {
                        ...formData.businessHours,
                        [day]: {
                          ...formData.businessHours[day],
                          close: e.target.value,
                        },
                      },
                    })
                  }
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Social Media */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Social Media</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Instagram</label>
              <Input
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="https://instagram.com/yourprofile"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Facebook</label>
              <Input
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                placeholder="https://facebook.com/yourpage"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Twitter</label>
              <Input
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                placeholder="https://twitter.com/yourprofile"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">YouTube</label>
              <Input
                value={formData.youtube}
                onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                placeholder="https://youtube.com/yourchannel"
              />
            </div>
          </div>
        </Card>

        {/* About & Mission */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">About & Mission</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">About Your Business</label>
              <Textarea
                value={formData.aboutText}
                onChange={(e) => setFormData({ ...formData, aboutText: e.target.value })}
                placeholder="Tell customers about your business..."
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mission Statement</label>
              <Textarea
                value={formData.mission}
                onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                placeholder="Your business mission..."
                rows={3}
              />
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Business Statistics</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Years in Business</label>
              <Input
                type="number"
                value={formData.yearsInBusiness}
                onChange={(e) => setFormData({ ...formData, yearsInBusiness: e.target.value })}
                placeholder="e.g., 15"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Projects Completed</label>
              <Input
                type="number"
                value={formData.projectsCompleted}
                onChange={(e) => setFormData({ ...formData, projectsCompleted: e.target.value })}
                placeholder="e.g., 500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Satisfaction Rate (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.satisfactionRate}
                onChange={(e) => setFormData({ ...formData, satisfactionRate: e.target.value })}
                placeholder="e.g., 98"
              />
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-2">
          <Button type="submit" disabled={updateMutation.isPending} size="lg">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
