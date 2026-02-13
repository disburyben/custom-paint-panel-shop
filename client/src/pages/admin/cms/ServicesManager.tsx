import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ServicesManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    shortDescription: "",
    startingPrice: "",
    priceDescription: "",
    features: [] as string[],
    turnaroundTime: "",
  });
  const [newFeature, setNewFeature] = useState("");

  const utils = trpc.useUtils();

  // Fetch all services
  const { data: services = [], isLoading } = trpc.cms.services.getAllAdmin.useQuery();

  // Create service
  const createMutation = trpc.cms.services.create.useMutation({
    onSuccess: () => {
      toast.success("Service created successfully");
      utils.cms.services.getAllAdmin.invalidate();
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error creating service: ${error.message}`);
    },
  });

  // Update service
  const updateMutation = trpc.cms.services.update.useMutation({
    onSuccess: () => {
      toast.success("Service updated successfully");
      utils.cms.services.getAllAdmin.invalidate();
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error updating service: ${error.message}`);
    },
  });

  // Delete service
  const deleteMutation = trpc.cms.services.delete.useMutation({
    onSuccess: () => {
      toast.success("Service deleted successfully");
      utils.cms.services.getAllAdmin.invalidate();
    },
    onError: (error) => {
      toast.error(`Error deleting service: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      shortDescription: "",
      startingPrice: "",
      priceDescription: "",
      features: [],
      turnaroundTime: "",
    });
    setNewFeature("");
    setIsCreating(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        ...formData,
        startingPrice: formData.startingPrice ? parseInt(formData.startingPrice) : undefined,
      });
    } else {
      createMutation.mutate({
        ...formData,
        startingPrice: formData.startingPrice ? parseInt(formData.startingPrice) : undefined,
      });
    }
  };

  const handleEdit = (service: any) => {
    const features = service.features ? JSON.parse(service.features) : [];
    setFormData({
      name: service.name,
      description: service.description,
      shortDescription: service.shortDescription || "",
      startingPrice: service.startingPrice ? (service.startingPrice / 100).toString() : "",
      priceDescription: service.priceDescription || "",
      features: features,
      turnaroundTime: service.turnaroundTime || "",
    });
    setEditingId(service.id);
    setIsCreating(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this service?")) {
      deleteMutation.mutate({ id });
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature],
      });
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-muted-foreground">Manage service offerings and pricing</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} className="gap-2">
          <Plus className="w-4 h-4" />
          {isCreating ? "Cancel" : "New Service"}
        </Button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">
            {editingId ? "Edit Service" : "Create New Service"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Service Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Custom Paint"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Short Description</label>
              <Input
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="Brief description for service cards"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Full Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed service description..."
                rows={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Starting Price ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.startingPrice}
                  onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                  placeholder="e.g., 500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price Description</label>
                <Input
                  value={formData.priceDescription}
                  onChange={(e) => setFormData({ ...formData, priceDescription: e.target.value })}
                  placeholder="e.g., Starting at $500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Turnaround Time</label>
              <Input
                value={formData.turnaroundTime}
                onChange={(e) => setFormData({ ...formData, turnaroundTime: e.target.value })}
                placeholder="e.g., 2-4 weeks"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Service Features</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addFeature}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="ml-1 hover:text-primary/70"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingId ? "Update Service" : "Create Service"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Services List */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">All Services</h2>
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : services.length === 0 ? (
          <p className="text-muted-foreground">No services yet. Create your first one!</p>
        ) : (
          <div className="space-y-3">
            {services.map((service: any) => (
              <div
                key={service.id}
                className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{service.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {service.shortDescription}
                  </p>
                  {service.priceDescription && (
                    <p className="text-sm font-medium text-primary">
                      {service.priceDescription}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(service)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(service.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
