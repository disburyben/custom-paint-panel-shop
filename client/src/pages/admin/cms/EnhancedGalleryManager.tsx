import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit2, Trash2, Upload, X, Eye, EyeOff, Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function EnhancedGalleryManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("custom-paint");
  const [vehicleType, setVehicleType] = useState("");
  const [servicesProvided, setServicesProvided] = useState("");
  const [sprayerId, setSprayerId] = useState<number | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);
  
  // Image upload state
  const [beforeImageFile, setBeforeImageFile] = useState<File | null>(null);
  const [afterImageFile, setAfterImageFile] = useState<File | null>(null);
  const [beforeImagePreview, setBeforeImagePreview] = useState<string>("");
  const [afterImagePreview, setAfterImagePreview] = useState<string>("");
  const [beforeImageUrl, setBeforeImageUrl] = useState("");
  const [afterImageUrl, setAfterImageUrl] = useState("");

  const utils = trpc.useUtils();

  // Queries
  const { data: items = [], isLoading } = trpc.gallery.getAllItems.useQuery({
    includeInactive: true,
  });
  const { data: sprayers = [] } = trpc.sprayer.getAllSprayers.useQuery();

  // Mutations
  const uploadImageMutation = trpc.gallery.uploadImage.useMutation();

  const createMutation = trpc.gallery.create.useMutation({
    onSuccess: () => {
      toast.success("Gallery item created successfully");
      utils.gallery.getAllItems.invalidate();
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error creating gallery item: ${error.message}`);
    },
  });

  const updateMutation = trpc.gallery.update.useMutation({
    onSuccess: () => {
      toast.success("Gallery item updated successfully");
      utils.gallery.getAllItems.invalidate();
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error updating gallery item: ${error.message}`);
    },
  });

  const deleteMutation = trpc.gallery.delete.useMutation({
    onSuccess: () => {
      toast.success("Gallery item deleted successfully");
      utils.gallery.getAllItems.invalidate();
    },
    onError: (error) => {
      toast.error(`Error deleting gallery item: ${error.message}`);
    },
  });

  const toggleActiveMutation = trpc.gallery.toggleActive.useMutation({
    onSuccess: () => {
      toast.success("Gallery item status updated");
      utils.gallery.getAllItems.invalidate();
    },
  });

  const toggleFeaturedMutation = trpc.gallery.toggleFeatured.useMutation({
    onSuccess: () => {
      toast.success("Featured status updated");
      utils.gallery.getAllItems.invalidate();
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("custom-paint");
    setVehicleType("");
    setServicesProvided("");
    setSprayerId(null);
    setIsFeatured(false);
    setBeforeImageFile(null);
    setAfterImageFile(null);
    setBeforeImagePreview("");
    setAfterImagePreview("");
    setBeforeImageUrl("");
    setAfterImageUrl("");
    setIsCreating(false);
    setEditingId(null);
  };

  const handleBeforeImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBeforeImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBeforeImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAfterImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAfterImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAfterImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File, imageType: "before" | "after") => {
    const reader = new FileReader();
    return new Promise<{ fileKey: string; url: string }>((resolve, reject) => {
      reader.onloadend = async () => {
        try {
          const base64Data = (reader.result as string).split(",")[1];
          const result = await uploadImageMutation.mutateAsync({
            fileName: file.name,
            fileData: base64Data,
            mimeType: file.type,
            imageType,
          });
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      if (editingId) {
        // Update existing item
        await updateMutation.mutateAsync({
          id: editingId,
          title,
          description: description || undefined,
          category,
          vehicleType: vehicleType || undefined,
          servicesProvided: servicesProvided || undefined,
          sprayerId: sprayerId || undefined,
          isFeatured: isFeatured ? 1 : 0,
        });
      } else {
        // Create new item - images are required
        if (!beforeImageFile || !afterImageFile) {
          toast.error("Both before and after images are required");
          return;
        }

        toast.info("Uploading images...");

        // Upload images
        const beforeUpload = await uploadImage(beforeImageFile, "before");
        const afterUpload = await uploadImage(afterImageFile, "after");

        // Create gallery item
        await createMutation.mutateAsync({
          title,
          description: description || undefined,
          category,
          vehicleType: vehicleType || undefined,
          servicesProvided: servicesProvided || undefined,
          sprayerId: sprayerId || undefined,
          beforeImageKey: beforeUpload.fileKey,
          beforeImageUrl: beforeUpload.url,
          afterImageKey: afterUpload.fileKey,
          afterImageUrl: afterUpload.url,
          isFeatured: isFeatured ? 1 : 0,
        });
      }
    } catch (error) {
      console.error("Error submitting gallery item:", error);
      toast.error("Failed to save gallery item");
    }
  };

  const handleEdit = (item: any) => {
    setTitle(item.title);
    setDescription(item.description || "");
    setCategory(item.category);
    setVehicleType(item.vehicleType || "");
    setServicesProvided(item.servicesProvided || "");
    setSprayerId(item.sprayerId || null);
    setIsFeatured(item.isFeatured === 1);
    setBeforeImageUrl(item.beforeImageUrl);
    setAfterImageUrl(item.afterImageUrl);
    setBeforeImagePreview(item.beforeImageUrl);
    setAfterImagePreview(item.afterImageUrl);
    setEditingId(item.id);
    setIsCreating(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this gallery item?")) {
      deleteMutation.mutate({ id });
    }
  };

  const categories = [
    { value: "custom-paint", label: "Custom Paint" },
    { value: "restoration", label: "Restoration" },
    { value: "collision-repair", label: "Collision Repair" },
    { value: "detailing", label: "Detailing" },
    { value: "other", label: "Other" },
  ];

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Gallery Manager</h1>
          <p className="text-muted-foreground">
            Upload images, add metadata, and assign sprayers
          </p>
        </div>
        <Button
          onClick={() => {
            if (isCreating) {
              resetForm();
            } else {
              setIsCreating(true);
            }
          }}
        >
          {isCreating ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add Gallery Item
            </>
          )}
        </Button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">
            {editingId ? "Edit Gallery Item" : "Add New Gallery Item"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., 1967 Mustang Candy Apple Red"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Project details..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <Input
                    id="vehicleType"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    placeholder="e.g., 1967 Ford Mustang Fastback"
                  />
                </div>

                <div>
                  <Label htmlFor="servicesProvided">Services Provided</Label>
                  <Textarea
                    id="servicesProvided"
                    value={servicesProvided}
                    onChange={(e) => setServicesProvided(e.target.value)}
                    placeholder="e.g., Custom Candy Apple Red Paint, Chrome Delete, Engine Bay Detail"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="sprayer">Sprayer</Label>
                  <Select
                    value={sprayerId?.toString() || "none"}
                    onValueChange={(value) =>
                      setSprayerId(value === "none" ? null : parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a sprayer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No sprayer assigned</SelectItem>
                      {sprayers.map((sprayer) => (
                        <SelectItem key={sprayer.id} value={sprayer.id.toString()}>
                          {sprayer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isFeatured">Featured Item</Label>
                </div>
              </div>

              {/* Right Column - Images */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="beforeImage">
                    Before Image {!editingId && "*"}
                  </Label>
                  <Input
                    id="beforeImage"
                    type="file"
                    accept="image/*"
                    onChange={handleBeforeImageChange}
                  />
                  {beforeImagePreview && (
                    <div className="mt-2">
                      <img
                        src={beforeImagePreview}
                        alt="Before preview"
                        className="w-full h-48 object-cover border rounded"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="afterImage">
                    After Image {!editingId && "*"}
                  </Label>
                  <Input
                    id="afterImage"
                    type="file"
                    accept="image/*"
                    onChange={handleAfterImageChange}
                  />
                  {afterImagePreview && (
                    <div className="mt-2">
                      <img
                        src={afterImagePreview}
                        alt="After preview"
                        className="w-full h-48 object-cover border rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createMutation.isPending ||
                  updateMutation.isPending ||
                  uploadImageMutation.isPending
                }
              >
                {createMutation.isPending ||
                updateMutation.isPending ||
                uploadImageMutation.isPending
                  ? "Saving..."
                  : editingId
                  ? "Update Item"
                  : "Create Item"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Gallery Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item: any) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="relative">
              <img
                src={item.afterImageUrl}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-1">
                {item.isFeatured === 1 && (
                  <div className="bg-yellow-500 text-white p-1 rounded">
                    <Star className="w-4 h-4" />
                  </div>
                )}
                {item.isActive === 1 ? (
                  <div className="bg-green-500 text-white p-1 rounded">
                    <Eye className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="bg-gray-500 text-white p-1 rounded">
                    <EyeOff className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold mb-1">{item.title}</h3>
              {item.vehicleType && (
                <p className="text-sm text-muted-foreground mb-1">
                  {item.vehicleType}
                </p>
              )}
              {item.servicesProvided && (
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {item.servicesProvided}
                </p>
              )}
              {item.sprayer && (
                <div className="flex items-center gap-2 mb-3">
                  {item.sprayer.logoUrl ? (
                    <img
                      src={item.sprayer.logoUrl}
                      alt={item.sprayer.name}
                      className="w-6 h-6 object-contain"
                    />
                  ) : null}
                  <span className="text-xs font-medium">{item.sprayer.name}</span>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(item)}
                >
                  <Edit2 className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleActiveMutation.mutate({ id: item.id })}
                >
                  {item.isActive === 1 ? "Hide" : "Show"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {items.length === 0 && !isCreating && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">
            No gallery items yet. Add your first project to get started.
          </p>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Gallery Item
          </Button>
        </Card>
      )}
    </div>
  );
}
