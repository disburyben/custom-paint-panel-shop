import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit2, Trash2, X, Link as LinkIcon, Images, Upload, Loader2 } from "lucide-react";
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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const uploadMutation = trpc.cms.upload.useMutation({
    onSuccess: (data) => {
      setImageUrls((prev) => [...prev, data.url]);
      toast.success("Image uploaded");
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: (e) => {
      toast.error(`Upload error: ${e.message}`);
      setIsUploading(false);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    // Upload files sequentially
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        continue;
      }

      const reader = new FileReader();
      const uploadPromise = new Promise<void>((resolve, reject) => {
        reader.onload = async (event) => {
          const base64Data = event.target?.result as string;
          uploadMutation.mutate({
            fileName: file.name,
            fileType: file.type,
            fileData: base64Data,
          }, {
            onSuccess: () => resolve(),
            onError: (err) => reject(err),
          });
        };
        reader.onerror = () => reject(new Error("File read failed"));
        reader.readAsDataURL(file);
      });

      try {
        await uploadPromise;
      } catch (err) {
        console.error("Upload failed for file", file.name, err);
      }
    }
    
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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

            <div>
              <label className="block text-sm font-medium mb-3">
                Photos * <span className="text-muted-foreground font-normal">— upload files or paste direct links</span>
              </label>

              {/* Upload and URL controls */}
              <div className="flex flex-wrap gap-3 mb-4 p-4 border rounded-lg bg-muted/30">
                {/* Direct Upload */}
                <div className="space-y-2 flex-1 min-w-[240px]">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Upload from Device</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                  />
                  <Button 
                    type="button" 
                    variant="default"
                    className="w-full h-10 gap-2 border-dashed border-2 hover:border-primary transition-all bg-background text-foreground hover:bg-accent"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {isUploading ? "Uploading..." : "Select Images to Upload"}
                  </Button>
                </div>

                <div className="hidden md:flex items-center text-muted-foreground font-bold">OR</div>

                {/* Paste URL */}
                <div className="space-y-2 flex-1 min-w-[240px]">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Paste Image URL</p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }}
                        placeholder="Paste URL and press Enter..."
                        className="pl-9 h-10"
                      />
                    </div>
                    <Button type="button" variant="outline" onClick={addUrl} className="h-10 px-3">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* URL list with previews */}
              {imageUrls.length === 0 ? (
                <div className="border-2 border-dashed border-border rounded-lg p-10 text-center text-muted-foreground bg-muted/10">
                  <Images className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No photos added yet</p>
                  <p className="text-xs mt-1">Upload images or paste links to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {imageUrls.map((url, i) => (
                    <div key={i} className="relative aspect-square border border-border rounded-lg overflow-hidden group bg-muted/20">
                      <img
                        src={toDirectUrl(url)}
                        alt={`Photo ${i + 1}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://placehold.co/400x400?text=Invalid+Image"; }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => removeUrl(i)}
                          className="p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg"
                          title="Remove photo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {i === 0 && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                          COVER
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-white px-2 py-1 truncate">
                        {url.split('/').pop()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {imageUrls.length > 0 && (
                <p className="text-xs text-muted-foreground mt-3 font-medium">
                  {imageUrls.length} photo{imageUrls.length !== 1 ? "s" : ""} in this album. Drag files to cover to reorder (coming soon).
                </p>
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
