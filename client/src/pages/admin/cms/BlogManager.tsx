import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function BlogManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    isFeatured: false,
    isPublished: false,
  });


  const utils = trpc.useUtils();

  // Fetch all blog posts
  const { data: posts = [], isLoading } = trpc.cms.blog.getAllAdmin.useQuery();

  // Create blog post
  const createMutation = trpc.cms.blog.create.useMutation({
    onSuccess: () => {
      toast.success("Blog post created successfully");
      utils.cms.blog.getAllAdmin.invalidate();
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error creating blog post: ${error.message}`);
    },
  });

  // Update blog post
  const updateMutation = trpc.cms.blog.update.useMutation({
    onSuccess: () => {
      toast.success("Blog post updated successfully");
      utils.cms.blog.getAllAdmin.invalidate();
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error updating blog post: ${error.message}`);
    },
  });

  // Delete blog post
  const deleteMutation = trpc.cms.blog.delete.useMutation({
    onSuccess: () => {
      toast.success("Blog post deleted successfully");
      utils.cms.blog.getAllAdmin.invalidate();
    },
    onError: (error) => {
      toast.error(`Error deleting blog post: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      category: "",
      isFeatured: false,
      isPublished: false,
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
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

  const handleEdit = (post: any) => {
    setFormData({
      title: post.title,
      excerpt: post.excerpt || "",
      content: post.content,
      category: post.category || "",
      isFeatured: post.isFeatured === 1,
      isPublished: post.isPublished === 1,
    });
    setEditingId(post.id);
    setIsCreating(true);
  };

  const handleDelete = (id: number) => {
    setConfirmDelete(id);
  };

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete blog post?"
        description="This will permanently delete the post and cannot be undone."
        onConfirm={() => {
          if (confirmDelete !== null) deleteMutation.mutate({ id: confirmDelete });
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground">Create and manage blog articles</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} className="gap-2">
          <Plus className="w-4 h-4" />
          {isCreating ? "Cancel" : "New Post"}
        </Button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">
            {editingId ? "Edit Blog Post" : "Create New Blog Post"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter blog post title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Excerpt</label>
              <Input
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief summary for listings"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Content *</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your blog post content here..."
                rows={10}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., news, project-showcase"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Publish immediately</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Featured post</span>
              </label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingId ? "Update Post" : "Create Post"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Blog Posts List */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">All Blog Posts</h2>
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : posts.length === 0 ? (
          <p className="text-muted-foreground">No blog posts yet. Create your first one!</p>
        ) : (
          <div className="space-y-3">
            {posts.map((post: any) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{post.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {post.category && `Category: ${post.category}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {post.isPublished === 1 ? (
                    <Eye className="w-4 h-4 text-green-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(post)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(post.id)}
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
