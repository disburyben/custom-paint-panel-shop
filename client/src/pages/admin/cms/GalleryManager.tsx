import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function GalleryManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "custom-paint",
    beforeImageUrl: "",
    afterImageUrl: "",
    isFeatured: false,
  });

  const utils = trpc.useUtils();
  const { data: items = [], isLoading } = trpc.cms.gallery.getAllAdmin.useQuery();

  const createMutation = trpc.cms.gallery.create.useMutation({
    onSuccess: () => {
      toast.success("Gallery item created successfully");
      utils.cms.gallery.getAllAdmin.invalidate();
      resetForm();
    },
    onError: (e) => toast.error(`Error: ${e.message}`),
  });

  const updateMutation = trpc.cms.gallery.update.useMutation({
    onSuccess: () => {
      toast.success("Gallery item updated successfully");
      utils.cms.gallery.getAllAdmin.invalidate();
      resetForm();
    },
    onError: (e) => toast.error(`Error: ${e.message}`),
  });

  const deleteMutation = trpc.cms.gallery.delete.useMutation({
    onSuccess: () => {
      toast.success("Gallery item deleted");
      utils.cms.gallery.getAllAdmin.invalidate();
    },
    onError: (e) => toast.error(`Error: ${e.message}`),
  });

  const resetForm = () => {
    setFormData({ title: "", description: "", category: "custom-paint", beforeImageUrl: "", afterImageUrl: "", isFeatured: false });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) { toast.error("Please enter a title"); return; }
    if (!formData.beforeImageUrl || !formData.afterImageUrl) { toast.error("Please enter both image URLs"); return; }

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (item: any) => {
    setFormData({
      title: item.title,
      description: item.description || "",
      category: item.category,
      beforeImageUrl: item.beforeImageUrl,
      afterImageUrl: item.afterImageUrl,
      isFeatured: item.isFeatured === 1,
    });
    setEditingId(item.id);
    setIsCreating(true);
  };

  const categories = [
    { value: "custom-paint", label: "Custom Paint" },
    { value: "restoration", label: "Restoration" },
    { value: "collision-repair", label: "Collision Repair" },
    { value: "detailing", label: "Detailing" },
    { value: "other", label: "Other" },
  ];

  const isPending = createMutation.isPending || updateMutation.isPending;

  // Convert Dropbox share link to direct URL
  const toDirectUrl = (url: string) =>
    url.replace("www.dropbox.com", "dl.dropboxusercontent.com").replace("?dl=0", "").replace("?dl=1", "");

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete gallery item?"
        description="This will permanently remove the project and cannot be undone."
        onConfirm={() => {
          if (confirmDelete !== null) deleteMutation.mutate({ id: confirmDelete });
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gallery</h1>
          <p className="text-muted-foreground">Manage before/after project photos</p>
        </div>
        <Button onClick={() => { if (isCreating) resetForm(); else setIsCreating(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          {isCreating ? "Cancel" : "New Gallery Item"}
        </Button>
      </div>

      {/* Form */}
      {isCreating && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">{editingId ? "Edit Gallery Item" : "Add New Gallery Item"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Project Title *</label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., 1967 Mustang Candy Apple Red" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Details about the project..." rows={3} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border border-input rounded-md bg-background">
                {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Before Image URL *</label>
                <Input value={formData.beforeImageUrl} onChange={(e) => setFormData({ ...formData, beforeImageUrl: e.target.value })} placeholder="Paste Dropbox or image link..." />
                {formData.beforeImageUrl && (
                  <img src={toDirectUrl(formData.beforeImageUrl)} alt="Before preview" className="mt-2 w-full h-28 object-cover rounded border border-border" onError={(e) => (e.currentTarget.style.display = "none")} />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">After Image URL *</label>
                <Input value={formData.afterImageUrl} onChange={(e) => setFormData({ ...formData, afterImageUrl: e.target.value })} placeholder="Paste Dropbox or image link..." />
                {formData.afterImageUrl && (
                  <img src={toDirectUrl(formData.afterImageUrl)} alt="After preview" className="mt-2 w-full h-28 object-cover rounded border border-border" onError={(e) => (e.currentTarget.style.display = "none")} />
                )}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} className="rounded" />
                <span className="text-sm">Featured project</span>
              </label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : editingId ? "Update Item" : "Add Item"}</Button>
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* List */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">All Gallery Items</h2>
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground">No gallery items yet. Add your first project!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item: any) => (
              <div key={item.id} className="border border-border rounded-lg overflow-hidden">
                <div className="grid grid-cols-2 gap-2 p-2 bg-muted/30">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Before</p>
                    <img src={toDirectUrl(item.beforeImageUrl)} alt="Before" className="w-full h-24 object-cover rounded" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">After</p>
                    <img src={toDirectUrl(item.afterImageUrl)} alt="After" className="w-full h-24 object-cover rounded" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{categories.find((c) => c.value === item.category)?.label}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}><Edit2 className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(item.id)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
