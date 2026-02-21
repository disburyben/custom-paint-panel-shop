import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit2, Trash2, X, Link as LinkIcon, Images } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

// Auto-convert Dropbox share links to direct image URLs
function toDirectUrl(url: string) {
  return url
    .replace("www.dropbox.com", "dl.dropboxusercontent.com")
    .replace(/[?&]dl=0/, "")
    .replace(/[?&]dl=1/, "");
}

export default function GalleryManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [newUrl, setNewUrl] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "custom-paint",
    isFeatured: false,
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const utils = trpc.useUtils();
  const { data: items = [], isLoading } = trpc.cms.gallery.getAllAdmin.useQuery();

  const createMutation = trpc.cms.gallery.create.useMutation({
    onSuccess: () => {
      toast.success("Gallery album created");
      utils.cms.gallery.getAllAdmin.invalidate();
      resetForm();
    },
    onError: (e) => toast.error(`Error: ${e.message}`),
  });

  const updateMutation = trpc.cms.gallery.update.useMutation({
    onSuccess: () => {
      toast.success("Gallery album updated");
      utils.cms.gallery.getAllAdmin.invalidate();
      resetForm();
    },
    onError: (e) => toast.error(`Error: ${e.message}`),
  });

  const deleteMutation = trpc.cms.gallery.delete.useMutation({
    onSuccess: () => {
      toast.success("Album deleted");
      utils.cms.gallery.getAllAdmin.invalidate();
    },
    onError: (e) => toast.error(`Error: ${e.message}`),
  });

  const resetForm = () => {
    setFormData({ title: "", description: "", category: "custom-paint", isFeatured: false });
    setImageUrls([]);
    setNewUrl("");
    setIsCreating(false);
    setEditingId(null);
  };

  const addUrl = () => {
    const trimmed = newUrl.trim();
    if (!trimmed) return;
    setImageUrls((prev) => [...prev, trimmed]);
    setNewUrl("");
  };

  const removeUrl = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) { toast.error("Please enter a title"); return; }
    if (imageUrls.length === 0) { toast.error("Please add at least one image URL"); return; }

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData, images: imageUrls });
    } else {
      createMutation.mutate({ ...formData, images: imageUrls });
    }
  };

  const handleEdit = (item: any) => {
    const urls: string[] = (() => {
      try { return JSON.parse(item.images); } catch { return []; }
    })();
    setFormData({
      title: item.title,
      description: item.description || "",
      category: item.category,
      isFeatured: item.isFeatured === 1,
    });
    setImageUrls(urls);
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

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete album?"
        description="This will permanently remove the album and all its photos. Cannot be undone."
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
          <p className="text-muted-foreground">Create photo albums — single shots, project galleries, anything</p>
        </div>
        <Button onClick={() => { if (isCreating) resetForm(); else setIsCreating(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          {isCreating ? "Cancel" : "New Album"}
        </Button>
      </div>

      {/* Create / Edit Form */}
      {isCreating && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">{editingId ? "Edit Album" : "New Album"}</h2>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">Album Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder='e.g. "Project Car 2.0", "Random Shots", "Ford Ranger Respray"'
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional notes about this album..."
                rows={2}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            {/* Image URLs */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Photos * <span className="text-muted-foreground font-normal">— paste Dropbox or direct image links, one at a time</span>
              </label>

              {/* Add URL row */}
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }}
                    placeholder="Paste image or Dropbox URL and press Enter..."
                    className="pl-9"
                  />
                </div>
                <Button type="button" variant="outline" onClick={addUrl} className="gap-1 shrink-0">
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </div>

              {/* URL list with previews */}
              {imageUrls.length === 0 ? (
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center text-muted-foreground">
                  <Images className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No photos yet — paste a URL above and click Add</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {imageUrls.map((url, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 border border-border rounded-lg bg-muted/20 group">
                      <img
                        src={toDirectUrl(url)}
                        alt={`Photo ${i + 1}`}
                        className="w-16 h-12 object-cover rounded shrink-0"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = ""; (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground truncate">{url}</p>
                        {i === 0 && <span className="text-xs text-primary font-medium">Cover photo</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeUrl(i)}
                        className="shrink-0 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">{imageUrls.length} photo{imageUrls.length !== 1 ? "s" : ""} in this album</p>
                </div>
              )}
            </div>

            {/* Featured */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Feature this album on the homepage</span>
            </label>

            <div className="flex gap-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : editingId ? "Update Album" : "Create Album"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Albums List */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">All Albums ({items.length})</h2>
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground">No albums yet. Create your first one!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((item: any) => {
              const urls: string[] = (() => { try { return JSON.parse(item.images); } catch { return []; } })();
              const cover = item.coverImageUrl || urls[0];
              return (
                <div key={item.id} className="border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-colors">
                  {/* Cover photo or grid of up to 4 */}
                  {urls.length === 0 ? (
                    <div className="h-36 bg-muted flex items-center justify-center">
                      <Images className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                  ) : urls.length === 1 ? (
                    <img src={toDirectUrl(cover)} alt={item.title} className="w-full h-36 object-cover" />
                  ) : (
                    <div className="grid grid-cols-2 h-36 gap-0.5">
                      {urls.slice(0, 4).map((u, i) => (
                        <div key={i} className="relative overflow-hidden">
                          <img src={toDirectUrl(u)} alt="" className="w-full h-full object-cover" />
                          {i === 3 && urls.length > 4 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="text-white text-lg font-bold">+{urls.length - 4}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                      {categories.find((c) => c.value === item.category)?.label} · {urls.length} photo{urls.length !== 1 ? "s" : ""}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(item.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
