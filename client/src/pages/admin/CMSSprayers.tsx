import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Upload, Eye, EyeOff } from "lucide-react";

export default function CMSSprayers() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSprayer, setEditingSprayer] = useState<any>(null);

  // Form state
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  const utils = trpc.useUtils();

  // Queries
  const { data: sprayers, isLoading } = trpc.sprayer.getAllSprayers.useQuery();

  // Mutations
  const createMutation = trpc.sprayer.create.useMutation({
    onSuccess: () => {
      toast.success("Sprayer created successfully");
      utils.sprayer.getAllSprayers.invalidate();
      resetForm();
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to create sprayer: ${error.message}`);
    },
  });

  const updateMutation = trpc.sprayer.update.useMutation({
    onSuccess: () => {
      toast.success("Sprayer updated successfully");
      utils.sprayer.getAllSprayers.invalidate();
      resetForm();
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to update sprayer: ${error.message}`);
    },
  });

  const deleteMutation = trpc.sprayer.delete.useMutation({
    onSuccess: () => {
      toast.success("Sprayer deleted successfully");
      utils.sprayer.getAllSprayers.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to delete sprayer: ${error.message}`);
    },
  });

  const toggleActiveMutation = trpc.sprayer.toggleActive.useMutation({
    onSuccess: () => {
      toast.success("Sprayer status updated");
      utils.sprayer.getAllSprayers.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  const uploadLogoMutation = trpc.sprayer.uploadLogo.useMutation();

  const resetForm = () => {
    setName("");
    setTitle("");
    setBio("");
    setLogoFile(null);
    setLogoPreview("");
    setEditingSprayer(null);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      let logoKey = "";
      let logoUrl = "";

      // Upload logo if provided
      if (logoFile) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Data = (reader.result as string).split(",")[1];
          const uploadResult = await uploadLogoMutation.mutateAsync({
            fileName: logoFile.name,
            fileData: base64Data,
            mimeType: logoFile.type,
          });
          logoKey = uploadResult.fileKey;
          logoUrl = uploadResult.url;

          // Create sprayer with logo
          await createMutation.mutateAsync({
            name,
            title: title || undefined,
            bio: bio || undefined,
            logoKey,
            logoUrl,
          });
        };
        reader.readAsDataURL(logoFile);
      } else {
        // Create sprayer without logo
        await createMutation.mutateAsync({
          name,
          title: title || undefined,
          bio: bio || undefined,
        });
      }
    } catch (error) {
      console.error("Error creating sprayer:", error);
    }
  };

  const handleEdit = (sprayer: any) => {
    setEditingSprayer(sprayer);
    setName(sprayer.name);
    setTitle(sprayer.title || "");
    setBio(sprayer.bio || "");
    setLogoPreview(sprayer.logoUrl || "");
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingSprayer) return;

    try {
      let logoKey = editingSprayer.logoKey;
      let logoUrl = editingSprayer.logoUrl;

      // Upload new logo if provided
      if (logoFile) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Data = (reader.result as string).split(",")[1];
          const uploadResult = await uploadLogoMutation.mutateAsync({
            fileName: logoFile.name,
            fileData: base64Data,
            mimeType: logoFile.type,
          });
          logoKey = uploadResult.fileKey;
          logoUrl = uploadResult.url;

          // Update sprayer with new logo
          await updateMutation.mutateAsync({
            id: editingSprayer.id,
            name,
            title: title || undefined,
            bio: bio || undefined,
            logoKey,
            logoUrl,
          });
        };
        reader.readAsDataURL(logoFile);
      } else {
        // Update sprayer without changing logo
        await updateMutation.mutateAsync({
          id: editingSprayer.id,
          name,
          title: title || undefined,
          bio: bio || undefined,
        });
      }
    } catch (error) {
      console.error("Error updating sprayer:", error);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this sprayer?")) {
      deleteMutation.mutate({ id });
    }
  };

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
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sprayer Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage painters/technicians who work on vehicles
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Sprayer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Sprayer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., John Smith"
                />
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Master Painter, Lead Technician"
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Short bio about the sprayer..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="logo">Logo/Badge</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
                {logoPreview && (
                  <div className="mt-2">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-24 h-24 object-contain border rounded"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending || uploadLogoMutation.isPending}
                >
                  {createMutation.isPending || uploadLogoMutation.isPending
                    ? "Creating..."
                    : "Create Sprayer"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sprayers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sprayers?.map((sprayer) => (
          <Card key={sprayer.id} className="p-4">
            <div className="flex items-start gap-4">
              {sprayer.logoUrl ? (
                <img
                  src={sprayer.logoUrl}
                  alt={sprayer.name}
                  className="w-16 h-16 object-contain border rounded"
                />
              ) : (
                <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                  <span className="text-2xl font-bold text-muted-foreground">
                    {sprayer.name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold">{sprayer.name}</h3>
                    {sprayer.title && (
                      <p className="text-sm text-muted-foreground">
                        {sprayer.title}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleActiveMutation.mutate({ id: sprayer.id })}
                  >
                    {sprayer.isActive === 1 ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {sprayer.bio && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {sprayer.bio}
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(sprayer)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(sprayer.id)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Sprayer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., John Smith"
              />
            </div>
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Master Painter, Lead Technician"
              />
            </div>
            <div>
              <Label htmlFor="edit-bio">Bio</Label>
              <Textarea
                id="edit-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Short bio about the sprayer..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-logo">Logo/Badge</Label>
              <Input
                id="edit-logo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
              />
              {logoPreview && (
                <div className="mt-2">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-24 h-24 object-contain border rounded"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={updateMutation.isPending || uploadLogoMutation.isPending}
              >
                {updateMutation.isPending || uploadLogoMutation.isPending
                  ? "Updating..."
                  : "Update Sprayer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {sprayers?.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">
            No sprayers yet. Add your first sprayer to get started.
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Sprayer
          </Button>
        </Card>
      )}
    </div>
  );
}
