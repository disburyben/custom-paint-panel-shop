import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Upload } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function AdminTeam() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [showPortfolioDialog, setShowPortfolioDialog] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const { data: teamMembers, refetch } = trpc.team.adminList.useQuery();
  const createMember = trpc.team.create.useMutation();
  const updateMember = trpc.team.update.useMutation();
  const deleteMember = trpc.team.delete.useMutation();
  const uploadHeadshot = trpc.team.uploadHeadshot.useMutation();
  const createPortfolio = trpc.team.createPortfolioItem.useMutation();

  const handleCreateMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await createMember.mutateAsync({
        name: formData.get("name") as string,
        title: formData.get("title") as string,
        bio: formData.get("bio") as string,
        specialty: formData.get("specialty") as string,
        displayOrder: parseInt(formData.get("displayOrder") as string) || 0,
      });

      toast.success("Team member added successfully");
      setShowAddDialog(false);
      refetch();
    } catch (error) {
      toast.error("Failed to add team member");
    }
  };

  const handleUploadHeadshot = async (memberId: number, file: File) => {
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        await uploadHeadshot.mutateAsync({
          id: memberId,
          imageData: base64,
          fileName: file.name,
        });
        toast.success("Headshot uploaded successfully");
        refetch();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to upload headshot");
    }
  };

  const handleDeleteMember = async (id: number) => {
    setConfirmDeleteId(id);
  };

  const handleAddPortfolioItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    const formData = new FormData(e.currentTarget);
    const fileInput = formData.get("image") as File;

    if (!fileInput || fileInput.size === 0) {
      toast.error("Please select an image");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        await createPortfolio.mutateAsync({
          teamMemberId: selectedMemberId,
          title: formData.get("title") as string,
          description: formData.get("description") as string,
          category: formData.get("category") as string,
          imageData: base64,
          fileName: fileInput.name,
          displayOrder: 0,
          isFeatured: 0,
        });
        toast.success("Portfolio item added");
        setShowPortfolioDialog(false);
        refetch();
      };
      reader.readAsDataURL(fileInput);
    } catch (error) {
      toast.error("Failed to add portfolio item");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Delete team member?"
        description="This will delete the team member and all their portfolio items. This cannot be undone."
        onConfirm={async () => {
          if (confirmDeleteId !== null) {
            try {
              await deleteMember.mutateAsync({ id: confirmDeleteId });
              toast.success("Team member deleted");
              refetch();
            } catch {
              toast.error("Failed to delete team member");
            }
          }
          setConfirmDeleteId(null);
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">TEAM MANAGEMENT</h1>
            <p className="text-gray-400">Manage team members and their portfolios</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="bg-orange-600 hover:bg-orange-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Team Member
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers?.map((member) => (
            <Card key={member.id} className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <div className="relative w-full aspect-square mb-4 bg-zinc-800 rounded-lg overflow-hidden">
                  {member.headshotUrl ? (
                    <img src={member.headshotUrl} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      No Photo
                    </div>
                  )}
                  <label className="absolute bottom-2 right-2 bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-full cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadHeadshot(member.id, file);
                      }}
                    />
                  </label>
                </div>
                <CardTitle className="text-white">{member.name}</CardTitle>
                <CardDescription className="text-orange-400">{member.title}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {member.specialty && (
                  <p className="text-sm text-gray-400">
                    <strong>Specialty:</strong> {member.specialty}
                  </p>
                )}
                {member.bio && (
                  <p className="text-sm text-gray-300">{member.bio}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSelectedMemberId(member.id);
                      setShowPortfolioDialog(true);
                    }}
                  >
                    Add Portfolio
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingMember(member)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteMember(member.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Team Member Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="bg-zinc-900 text-white border-zinc-800">
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateMember} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input id="name" name="name" required className="bg-zinc-800 border-zinc-700" />
              </div>
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input id="title" name="title" required placeholder="e.g., Master Painter" className="bg-zinc-800 border-zinc-700" />
              </div>
              <div>
                <Label htmlFor="specialty">Specialty</Label>
                <Input id="specialty" name="specialty" placeholder="e.g., Custom Candy Finishes" className="bg-zinc-800 border-zinc-700" />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" name="bio" rows={3} className="bg-zinc-800 border-zinc-700" />
              </div>
              <div>
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input id="displayOrder" name="displayOrder" type="number" defaultValue="0" className="bg-zinc-800 border-zinc-700" />
              </div>
              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
                Add Team Member
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Portfolio Item Dialog */}
        <Dialog open={showPortfolioDialog} onOpenChange={setShowPortfolioDialog}>
          <DialogContent className="bg-zinc-900 text-white border-zinc-800">
            <DialogHeader>
              <DialogTitle>Add Portfolio Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddPortfolioItem} className="space-y-4">
              <div>
                <Label htmlFor="title">Project Title *</Label>
                <Input id="title" name="title" required placeholder="e.g., 1967 Mustang Candy Apple Red" className="bg-zinc-800 border-zinc-700" />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" placeholder="e.g., Custom Paint, Restoration" className="bg-zinc-800 border-zinc-700" />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} className="bg-zinc-800 border-zinc-700" />
              </div>
              <div>
                <Label htmlFor="image">Image *</Label>
                <Input id="image" name="image" type="file" accept="image/*" required className="bg-zinc-800 border-zinc-700" />
              </div>
              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
                Add Portfolio Item
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
