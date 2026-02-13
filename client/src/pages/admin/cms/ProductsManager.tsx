import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit2, Trash2, Package, Tag, DollarSign } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function ProductsManager() {
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        basePrice: "", // handle as string input, convert to number
        type: "physical" as "physical" | "gift_certificate" | "service",
        isActive: true,
        hasVariants: false,
        images: [] as string[],
    });
    const [newImage, setNewImage] = useState("");

    const utils = trpc.useUtils();

    // Fetch all products (admin)
    const { data: products = [], isLoading } = trpc.shop.products.listAdmin.useQuery();

    // Create product
    const createMutation = trpc.shop.products.create.useMutation({
        onSuccess: () => {
            toast.success("Product created successfully");
            utils.shop.products.listAdmin.invalidate();
            resetForm();
        },
        onError: (error) => {
            toast.error(`Error creating product: ${error.message}`);
        },
    });

    // Update product
    const updateMutation = trpc.shop.products.update.useMutation({
        onSuccess: () => {
            toast.success("Product updated successfully");
            utils.shop.products.listAdmin.invalidate();
            resetForm();
        },
        onError: (error) => {
            toast.error(`Error updating product: ${error.message}`);
        },
    });

    // Delete product
    const deleteMutation = trpc.shop.products.delete.useMutation({
        onSuccess: () => {
            toast.success("Product deleted successfully");
            utils.shop.products.listAdmin.invalidate();
        },
        onError: (error) => {
            toast.error(`Error deleting product: ${error.message}`);
        },
    });

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            basePrice: "",
            type: "physical",
            isActive: true,
            hasVariants: false,
            images: [],
        });
        setNewImage("");
        setIsCreating(false);
        setEditingId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.basePrice) {
            toast.error("Please fill in all required fields");
            return;
        }

        const price = Math.round(parseFloat(formData.basePrice) * 100); // Convert to cents

        if (editingId) {
            updateMutation.mutate({
                id: editingId,
                name: formData.name,
                description: formData.description,
                basePrice: price,
                type: formData.type,
                isActive: formData.isActive,
                hasVariants: formData.hasVariants,
                images: formData.images,
            });
        } else {
            createMutation.mutate({
                name: formData.name,
                description: formData.description,
                basePrice: price,
                type: formData.type,
                isActive: formData.isActive,
                hasVariants: formData.hasVariants,
                images: formData.images,
            });
        }
    };

    const handleEdit = (product: any) => {
        const images = product.images ? JSON.parse(product.images as string) : [];
        setFormData({
            name: product.name,
            description: product.description || "",
            basePrice: (product.basePrice / 100).toString(),
            type: product.type as any,
            isActive: Boolean(product.isActive),
            hasVariants: Boolean(product.hasVariants),
            images: images,
        });
        setEditingId(product.id);
        setIsCreating(true);
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this product?")) {
            deleteMutation.mutate({ id });
        }
    };

    const addImage = () => {
        if (newImage.trim()) {
            setFormData({
                ...formData,
                images: [...formData.images, newImage],
            });
            setNewImage("");
        }
    };

    const removeImage = (index: number) => {
        setFormData({
            ...formData,
            images: formData.images.filter((_, i) => i !== index),
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Products</h1>
                    <p className="text-muted-foreground">Manage shop products and inventory</p>
                </div>
                <Button onClick={() => setIsCreating(!isCreating)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    {isCreating ? "Cancel" : "New Product"}
                </Button>
            </div>

            {/* Create/Edit Form */}
            {isCreating && (
                <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-4">
                        {editingId ? "Edit Product" : "Create New Product"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Product Name *</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Ceramic Coating Kit"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Product Type</label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(val: any) => setFormData({ ...formData, type: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="physical">Physical Item</SelectItem>
                                        <SelectItem value="gift_certificate">Gift Certificate</SelectItem>
                                        <SelectItem value="service">Service</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Product description..."
                                rows={4}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div>
                                <label className="block text-sm font-medium mb-1">Base Price ($) *</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        step="0.01"
                                        className="pl-9"
                                        value={formData.basePrice}
                                        onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 pb-2">
                                <Switch
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                />
                                <Label htmlFor="isActive">Active (Visible in Shop)</Label>
                            </div>

                            <div className="flex items-center space-x-2 pb-2">
                                <Switch
                                    id="hasVariants"
                                    checked={formData.hasVariants}
                                    onCheckedChange={(checked) => setFormData({ ...formData, hasVariants: checked })}
                                />
                                <Label htmlFor="hasVariants">Has Variants (Size, Color)</Label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Images (URLs)</label>
                            <div className="flex gap-2 mb-2">
                                <Input
                                    value={newImage}
                                    onChange={(e) => setNewImage(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addImage();
                                        }
                                    }}
                                />
                                <Button type="button" variant="outline" onClick={addImage}>
                                    Add
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {formData.images.map((img, index) => (
                                    <div key={index} className="flex items-center gap-2 bg-secondary/50 p-2 rounded">
                                        <img src={img} alt="Preview" className="w-8 h-8 object-cover rounded" />
                                        <span className="text-xs truncate flex-1">{img}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="hover:text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                {editingId ? "Update Product" : "Create Product"}
                            </Button>
                            <Button type="button" variant="outline" onClick={resetForm}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Products List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <p className="text-muted-foreground col-span-full text-center py-10">Loading products...</p>
                ) : products.length === 0 ? (
                    <p className="text-muted-foreground col-span-full text-center py-10">No products yet.</p>
                ) : (
                    products.map((product: any) => (
                        <Card key={product.id} className="overflow-hidden group">
                            <div className="aspect-video bg-secondary relative">
                                {product.images && JSON.parse(product.images as string)[0] ? (
                                    <img
                                        src={JSON.parse(product.images as string)[0]}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                        <Package className="w-8 h-8 opacity-20" />
                                    </div>
                                )}
                                {!product.isActive && (
                                    <div className="absolute top-2 right-2 bg-yellow-500/90 text-black text-xs font-bold px-2 py-1 rounded">
                                        DRAFT
                                    </div>
                                )}
                            </div>

                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold truncate pr-2">{product.name}</h3>
                                    <span className="font-mono text-sm">
                                        ${(product.basePrice / 100).toFixed(2)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                                    <Tag className="w-3 h-3" />
                                    <span className="capitalize">{product.type.replace('_', ' ')}</span>
                                </div>

                                <div className="flex gap-2 mt-auto">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleEdit(product)}
                                    >
                                        <Edit2 className="w-3 h-3 mr-2" /> Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-destructive hover:text-destructive hover:border-destructive"
                                        onClick={() => handleDelete(product.id)}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
