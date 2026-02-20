import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit2, Trash2, Upload, X, ImageIcon } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

// ── Shared types ────────────────────────────────────────────────────────────

interface ImageFile {
  fileData: string;   // base64 data URL
  fileName: string;
  fileType: string;
  previewUrl: string; // same as fileData for local preview
}

// ── ImageUploadField ─────────────────────────────────────────────────────────

interface ImageUploadFieldProps {
  label: string;
  value: ImageFile | null;
  existingUrl?: string;       // shown when editing an existing item
  onChange: (file: ImageFile | null) => void;
  required?: boolean;
}

function ImageUploadField({ label, value, existingUrl, onChange, required }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileData = e.target?.result as string;
      onChange({ fileData, fileName: file.name, fileType: file.type, previewUrl: fileData });
    };
    reader.readAsDataURL(file);
  }, [onChange]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // reset input so same file can be re-selected
    e.target.value = "";
  };

  const previewSrc = value?.previewUrl ?? existingUrl;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Preview */}
      {previewSrc && (
        <div className="relative group">
          <img
            src={previewSrc}
            alt={label}
            className="w-full h-36 object-cover rounded-md border border-border"
          />
          {/* Change overlay */}
          <div
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center cursor-pointer gap-2"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">Replace image</span>
          </div>
          {/* Clear button */}
          <button
            type="button"
            className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onChange(null)}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Drop zone — shown when no preview */}
      {!previewSrc && (
        <div
          className={`border-2 border-dashed rounded-md h-36 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
            }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <ImageIcon className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center px-4">
            <span className="font-medium text-foreground">Click to upload</span> or drag & drop
            <br />
            <span className="text-xs">PNG, JPG, WEBP up to 10 MB</span>
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

// ── GalleryManager ───────────────────────────────────────────────────────────

interface FormData {
  title: string;
  description: string;
  category: string;
  isFeatured: boolean;
}

interface ImageState {
  before: ImageFile | null;
  after: ImageFile | null;
}

export default function GalleryManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null); // holds full item for existing URLs
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category: "custom-paint",
    isFeatured: false,
  });
  const [images, setImages] = useState<ImageState>({ before: null, after: null });

  const utils = trpc.useUtils();

  const { data: items = [], isLoading } = trpc.cms.gallery.getAllAdmin.useQuery();

  const createMutation = trpc.cms.gallery.create.useMutation({
    onSuccess: () => {
      toast.success("Gallery item created successfully");
      utils.cms.gallery.getAllAdmin.invalidate();
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error creating gallery item: ${error.message}`);
    },
  });

  const updateMutation = trpc.cms.gallery.update.useMutation({
    onSuccess: () => {
      toast.success("Gallery item updated successfully");
      utils.cms.gallery.getAllAdmin.invalidate();
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error updating gallery item: ${error.message}`);
    },
  });

  const deleteMutation = trpc.cms.gallery.delete.useMutation({
    onSuccess: () => {
      toast.success("Gallery item deleted successfully");
      utils.cms.gallery.getAllAdmin.invalidate();
    },
    onError: (error) => {
      toast.error(`Error deleting gallery item: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({ title: "", description: "", category: "custom-paint", isFeatured: false });
    setImages({ before: null, after: null });
    setIsCreating(false);
    setEditingId(null);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      toast.error("Please enter a project title");
      return;
    }

    if (editingId) {
      // Update: images are optional (only upload if a new one was selected)
      updateMutation.mutate({
        id: editingId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        isFeatured: formData.isFeatured,
        ...(images.before && {
          beforeImage: {
            fileData: images.before.fileData,
            fileName: images.before.fileName,
            fileType: images.before.fileType,
          },
        }),
        ...(images.after && {
          afterImage: {
            fileData: images.after.fileData,
            fileName: images.after.fileName,
            fileType: images.after.fileType,
          },
        }),
      });
    } else {
      // Create: both images are required
      if (!images.before || !images.after) {
        toast.error("Please upload both a Before and After image");
        return;
      }
      createMutation.mutate({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        isFeatured: formData.isFeatured,
        beforeImage: {
          fileData: images.before.fileData,
          fileName: images.before.fileName,
          fileType: images.before.fileType,
        },
        afterImage: {
          fileData: images.after.fileData,
          fileName: images.after.fileName,
          fileType: images.after.fileType,
        },
      });
    }
  };

  const handleEdit = (item: any) => {
    setFormData({
      title: item.title,
      description: item.description || "",
      category: item.category,
      isFeatured: item.isFeatured === 1,
    });
    setImages({ before: null, after: null });
    setEditingItem(item);
    setEditingId(item.id);
    setIsCreating(true);
  };

  const handleDelete = (id: number) => {
    setConfirmDelete(id);
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
        title="Delete gallery item?"
        description="This will permanently remove the project photos and cannot be undone."
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
        <Button
          onClick={() => {
            if (isCreating) resetForm();
            else setIsCreating(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          {isCreating ? "Cancel" : "New Gallery Item"}
        </Button>
      </div>

      {/* Create / Edit Form */}
      {isCreating && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">
            {editingId ? "Edit Gallery Item" : "Add New Gallery Item"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Project Title <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., 1967 Mustang Candy Apple Red"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Details about the project..."
                rows={3}
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
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Image uploads */}
            <div className="grid grid-cols-2 gap-4">
              <ImageUploadField
                label="Before Image"
                value={images.before}
                existingUrl={editingItem?.beforeImageUrl}
                onChange={(file) => setImages((prev) => ({ ...prev, before: file }))}
                required={!editingId}
              />
              <ImageUploadField
                label="After Image"
                value={images.after}
                existingUrl={editingItem?.afterImageUrl}
                onChange={(file) => setImages((prev) => ({ ...prev, after: file }))}
                required={!editingId}
              />
            </div>

            {/* Featured */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Featured project</span>
              </label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Upload className="w-4 h-4 animate-bounce" />
                    Uploading...
                  </span>
                ) : editingId ? (
                  "Update Item"
                ) : (
                  "Add Item"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Gallery Items List */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">All Gallery Items</h2>
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground">No gallery items yet. Add your first project!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item: any) => (
              <div
                key={item.id}
                className="border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
              >
                <div className="grid grid-cols-2 gap-2 p-2 bg-muted/30">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Before</p>
                    <img
                      src={item.beforeImageUrl}
                      alt="Before"
                      className="w-full h-24 object-cover rounded"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">After</p>
                    <img
                      src={item.afterImageUrl}
                      alt="After"
                      className="w-full h-24 object-cover rounded"
                    />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    {categories.find((c) => c.value === item.category)?.label}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
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
