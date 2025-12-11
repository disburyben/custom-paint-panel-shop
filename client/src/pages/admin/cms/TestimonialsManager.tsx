import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit2, Trash2, Check, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function TestimonialsManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    customerName: "",
    customerTitle: "",
    quote: "",
    rating: 5,
    isFeatured: false,
    isApproved: false,
  });

  const utils = trpc.useUtils();

  // Fetch all testimonials
  const { data: testimonials = [], isLoading } = trpc.cms.testimonials.getAllAdmin.useQuery();

  // Create testimonial
  const createMutation = trpc.cms.testimonials.create.useMutation({
    onSuccess: () => {
      toast.success("Testimonial created successfully");
      utils.cms.testimonials.getAllAdmin.invalidate();
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error creating testimonial: ${error.message}`);
    },
  });

  // Update testimonial
  const updateMutation = trpc.cms.testimonials.update.useMutation({
    onSuccess: () => {
      toast.success("Testimonial updated successfully");
      utils.cms.testimonials.getAllAdmin.invalidate();
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error updating testimonial: ${error.message}`);
    },
  });

  // Delete testimonial
  const deleteMutation = trpc.cms.testimonials.delete.useMutation({
    onSuccess: () => {
      toast.success("Testimonial deleted successfully");
      utils.cms.testimonials.getAllAdmin.invalidate();
    },
    onError: (error) => {
      toast.error(`Error deleting testimonial: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      customerName: "",
      customerTitle: "",
      quote: "",
      rating: 5,
      isFeatured: false,
      isApproved: false,
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName || !formData.quote) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (testimonial: any) => {
    setFormData({
      customerName: testimonial.customerName,
      customerTitle: testimonial.customerTitle || "",
      quote: testimonial.quote,
      rating: testimonial.rating,
      isFeatured: testimonial.isFeatured === 1,
      isApproved: testimonial.isApproved === 1,
    });
    setEditingId(testimonial.id);
    setIsCreating(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this testimonial?")) {
      deleteMutation.mutate({ id });
    }
  };

  const toggleApproval = (testimonial: any) => {
    updateMutation.mutate({
      id: testimonial.id,
      isApproved: testimonial.isApproved === 1 ? false : true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Testimonials</h1>
          <p className="text-muted-foreground">Manage customer reviews and testimonials</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} className="gap-2">
          <Plus className="w-4 h-4" />
          {isCreating ? "Cancel" : "New Testimonial"}
        </Button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">
            {editingId ? "Edit Testimonial" : "Add New Testimonial"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Customer Name *</label>
                <Input
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="e.g., John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title/Vehicle</label>
                <Input
                  value={formData.customerTitle}
                  onChange={(e) => setFormData({ ...formData, customerTitle: e.target.value })}
                  placeholder="e.g., 1967 Mustang Owner"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Testimonial Quote *</label>
              <Textarea
                value={formData.quote}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                placeholder="Enter the customer's testimonial..."
                rows={5}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Rating</label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value={5}>5 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={3}>3 Stars</option>
                <option value={2}>2 Stars</option>
                <option value={1}>1 Star</option>
              </select>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isApproved}
                  onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Approve for display</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Featured testimonial</span>
              </label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingId ? "Update Testimonial" : "Add Testimonial"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Testimonials List */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">All Testimonials</h2>
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : testimonials.length === 0 ? (
          <p className="text-muted-foreground">No testimonials yet. Add your first one!</p>
        ) : (
          <div className="space-y-3">
            {testimonials.map((testimonial: any) => (
              <div
                key={testimonial.id}
                className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{testimonial.customerName}</h3>
                    {testimonial.isApproved === 1 ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {testimonial.customerTitle}
                  </p>
                  <p className="text-sm italic">"{testimonial.quote}"</p>
                  <div className="flex gap-1 mt-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-500">★</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleApproval(testimonial)}
                    title={testimonial.isApproved === 1 ? "Unapprove" : "Approve"}
                  >
                    {testimonial.isApproved === 1 ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-red-600" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(testimonial)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(testimonial.id)}
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
