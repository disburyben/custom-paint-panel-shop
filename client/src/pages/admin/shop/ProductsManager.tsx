import { useState, useRef } from "react";

import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Package,
    Plus,
    Search,
    Pencil,
    Trash2,
    Eye,
    EyeOff,
    Star,
    StarOff,
    Loader2,
    X,
    Link as LinkIcon,
    Images,
    Upload
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

/** Format cents → display price */
function formatPrice(cents: number) {
    return `$${(cents / 100).toFixed(2)}`;
}

export default function ProductsManager() {
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [managingVariants, setManagingVariants] = useState<any>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [confirmDeleteName, setConfirmDeleteName] = useState("");

    const {
        data: products,
        isLoading,
        refetch,
    } = trpc.shop.adminListProducts.useQuery();

    const createMutation = trpc.shop.createProduct.useMutation({
        onSuccess: () => {
            toast.success("Product created");
            setShowCreateDialog(false);
            refetch();
        },
        onError: (e) => toast.error(e.message),
    });

    const updateMutation = trpc.shop.updateProduct.useMutation({
        onSuccess: () => {
            toast.success("Product updated");
            setEditingProduct(null);
            refetch();
        },
        onError: (e) => toast.error(e.message),
    });

    const deleteMutation = trpc.shop.deleteProduct.useMutation({
        onSuccess: () => {
            toast.success("Product deleted");
            refetch();
        },
        onError: (e) => toast.error(e.message),
    });

    const filtered = products?.filter(
        (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.category ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeCount = products?.filter((p) => p.isActive === 1).length ?? 0;
    const featuredCount = products?.filter((p) => p.featured === 1).length ?? 0;

    return (
        <div className="space-y-6">
            <ConfirmDialog
                open={confirmDeleteId !== null}
                title={`Delete "${confirmDeleteName}"?`}
                description="This action cannot be undone."
                onConfirm={() => {
                    if (confirmDeleteId !== null) deleteMutation.mutate({ id: confirmDeleteId });
                    setConfirmDeleteId(null);
                }}
                onCancel={() => setConfirmDeleteId(null)}
            />
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">PRODUCTS</h1>
                    <p className="text-muted-foreground">
                        Manage merchandise and gift certificate products
                    </p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Product
                </Button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold">{products?.length ?? 0}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Active</p>
                        <p className="text-2xl font-bold">{activeCount}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Featured</p>
                        <p className="text-2xl font-bold">{featuredCount}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : !filtered?.length ? (
                        <div className="text-center py-12">
                            <Package className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                            <p className="text-muted-foreground">No products yet</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-3"
                                onClick={() => setShowCreateDialog(true)}
                            >
                                Create your first product
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-medium">
                                            {product.name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{product.type}</Badge>
                                        </TableCell>
                                        <TableCell>{product.category ?? "—"}</TableCell>
                                        <TableCell className="text-right font-mono">
                                            {formatPrice(product.basePrice)}
                                            {product.compareAtPrice && (
                                                <span className="ml-2 text-xs text-muted-foreground line-through">
                                                    {formatPrice(product.compareAtPrice)}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                {product.isActive ? (
                                                    <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">Draft</Badge>
                                                )}
                                                {product.featured === 1 && (
                                                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setManagingVariants(product)}
                                                    title="Manage Variants"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        updateMutation.mutate({
                                                            id: product.id,
                                                            isActive: product.isActive ? 0 : 1,
                                                        })
                                                    }
                                                    title={product.isActive ? "Deactivate" : "Activate"}
                                                >
                                                    {product.isActive ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        updateMutation.mutate({
                                                            id: product.id,
                                                            featured: product.featured ? 0 : 1,
                                                        })
                                                    }
                                                    title={
                                                        product.featured ? "Unfeature" : "Feature"
                                                    }
                                                >
                                                    {product.featured ? (
                                                        <StarOff className="h-4 w-4" />
                                                    ) : (
                                                        <Star className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setEditingProduct(product)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setConfirmDeleteId(product.id);
                                                        setConfirmDeleteName(product.name);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Create dialog */}
            <ProductFormDialog
                open={showCreateDialog}
                onClose={() => {
                    setShowCreateDialog(false);
                }}
                onSubmit={(data) => createMutation.mutate(data)}
                isPending={createMutation.isPending}
                title="Create Product"
            />

            {/* Edit dialog */}
            {editingProduct && (
                <ProductFormDialog
                    open
                    onClose={() => setEditingProduct(null)}
                    onSubmit={(data) =>
                        updateMutation.mutate({ id: editingProduct.id, ...data })
                    }
                    isPending={updateMutation.isPending}
                    title="Edit Product"
                    defaults={editingProduct}
                />
            )}
            {/* Variants dialog */}
            {managingVariants && (
                <VariantsManagerDialog
                    product={managingVariants}
                    onClose={() => setManagingVariants(null)}
                />
            )}
        </div>
    );
}

/* ─── product create/edit form ────────────────────────────── */

function ProductFormDialog({
    open,
    onClose,
    onSubmit,
    isPending,
    title,
    defaults,
}: {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    isPending: boolean;
    title: string;
    defaults?: any;
}) {
    const [name, setName] = useState(defaults?.name ?? "");
    const [slug, setSlug] = useState(defaults?.slug ?? "");
    const [description, setDescription] = useState(defaults?.description ?? "");
    const [type, setType] = useState(defaults?.type ?? "merchandise");
    const [category, setCategory] = useState(defaults?.category ?? "");
    const [basePrice, setBasePrice] = useState(
        defaults ? (defaults.basePrice / 100).toFixed(2) : ""
    );
    const [compareAtPrice, setCompareAtPrice] = useState(
        defaults?.compareAtPrice
            ? (defaults.compareAtPrice / 100).toFixed(2)
            : ""
    );
    const [hasVariants, setHasVariants] = useState(defaults?.hasVariants ?? 0);

    // Image logic
    const [imageUrls, setImageUrls] = useState<string[]>(() => {
        if (!defaults?.images) return [];
        try { return JSON.parse(defaults.images); } catch { return []; }
    });
    const [newUrl, setNewUrl] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadMutation = trpc.cms.upload.useMutation();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        let successCount = 0;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.type.startsWith("image/")) {
                toast.error(`${file.name} is not an image`);
                continue;
            }

            try {
                const base64Data = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (event) => resolve(event.target?.result as string);
                    reader.onerror = () => reject(new Error("Read failed"));
                    reader.readAsDataURL(file);
                });

                const result = await uploadMutation.mutateAsync({
                    fileName: file.name,
                    fileType: file.type,
                    fileData: base64Data,
                });

                setImageUrls((prev) => [...prev, result.url]);
                successCount++;
            } catch (err: any) {
                toast.error(`Upload failed: ${err.message}`);
            }
        }
        
        if (successCount > 0) {
            toast.success(`Uploaded ${successCount} images`);
        }

        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
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
        const data: any = {
            name,
            slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
            description: description || undefined,
            type,
            category: category || undefined,
            basePrice: Math.round(parseFloat(basePrice) * 100),
            hasVariants,
            images: JSON.stringify(imageUrls),
        };
        if (compareAtPrice) {
            data.compareAtPrice = Math.round(parseFloat(compareAtPrice) * 100);
        }
        onSubmit(data);
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name *</label>
                                <Input
                                    placeholder="Product name"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (!defaults)
                                            setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                                    }}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Slug *</label>
                                <Input
                                    placeholder="Slug"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <textarea
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-y min-h-[80px]"
                                placeholder="Product description..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type</label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="merchandise">Merchandise</SelectItem>
                                        <SelectItem value="gift_certificate">
                                            Gift Certificate
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <Input
                                    placeholder="e.g. Apparel, Accessories"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Price ($) *</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={basePrice}
                                    onChange={(e) => setBasePrice(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Compare At ($)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={compareAtPrice}
                                    onChange={(e) => setCompareAtPrice(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="hasVariants"
                                checked={hasVariants === 1}
                                onChange={(e) => setHasVariants(e.target.checked ? 1 : 0)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor="hasVariants" className="text-sm font-medium">
                                This product has options (e.g. Size, Color)
                            </label>
                        </div>

                        {/* Product Photos Section */}
                        <div className="space-y-3 pt-2 border-t">
                            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Product Photos</label>
                            
                            <div className="flex flex-wrap gap-3 p-4 border rounded-lg bg-muted/20">
                                {/* Upload Button */}
                                <div className="flex-1 min-w-[200px]">
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
                                        variant="outline"
                                        className="w-full h-10 gap-2 border-dashed"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                    >
                                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                        {isUploading ? "Uploading..." : "Upload Photos"}
                                    </Button>
                                </div>
                                
                                <div className="flex-1 min-w-[200px] flex gap-2">
                                    <Input
                                        placeholder="Or paste URL..."
                                        value={newUrl}
                                        onChange={(e) => setNewUrl(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }}
                                        className="h-10"
                                    />
                                    <Button type="button" variant="ghost" onClick={addUrl} className="h-10 px-3 border">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Previews */}
                            {imageUrls.length > 0 ? (
                                <div className="grid grid-cols-4 gap-3">
                                    {imageUrls.map((url, i) => (
                                        <div key={i} className="relative aspect-square rounded-md overflow-hidden border bg-muted/10 group">
                                            <img src={url} alt={`${name} ${i}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeUrl(i)}
                                                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                            {i === 0 && (
                                                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-white py-0.5 text-center font-bold">
                                                    MAIN
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 border-2 border-dashed rounded-lg bg-muted/5">
                                    <Images className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-xs text-muted-foreground">No photos added yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending || isUploading}>
                            {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            {defaults ? "Save Changes" : "Create Product"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

/* ─── variants manager dialog ────────────────────────────── */

function VariantsManagerDialog({
    product,
    onClose,
}: {
    product: any;
    onClose: () => void;
}) {
    const { data: result, isLoading, refetch } = trpc.shop.adminGetProduct.useQuery({ id: product.id });
    const variants = result?.variants ?? [];

    const [editingVariant, setEditingVariant] = useState<any>(null);
    const [showAddForm, setShowAddForm] = useState(false);

    const createMutation = trpc.shop.createVariant.useMutation({
        onSuccess: () => {
            toast.success("Variant added");
            setShowAddForm(false);
            refetch();
        },
        onError: (e) => toast.error(e.message),
    });

    const updateMutation = trpc.shop.updateVariant.useMutation({
        onSuccess: () => {
            toast.success("Variant updated");
            setEditingVariant(null);
            refetch();
        },
        onError: (e) => toast.error(e.message),
    });

    const deleteMutation = trpc.shop.deleteVariant.useMutation({
        onSuccess: () => {
            toast.success("Variant deleted");
            refetch();
        },
        onError: (e) => toast.error(e.message),
    });

    return (
        <Dialog open onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <div className="flex items-center justify-between mr-6">
                        <div>
                            <DialogTitle>Manage Variants</DialogTitle>
                            <p className="text-sm text-muted-foreground">{product.name}</p>
                        </div>
                        <Button size="sm" onClick={() => setShowAddForm(true)} disabled={showAddForm}>
                            <Plus className="w-4 h-4 mr-1" /> Add Variant
                        </Button>
                    </div>
                </DialogHeader>

                <div className="py-4">
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Add/Edit Form */}
                            {(showAddForm || editingVariant) && (
                                <VariantForm
                                    initialData={editingVariant}
                                    productId={product.id}
                                    onCancel={() => {
                                        setShowAddForm(false);
                                        setEditingVariant(null);
                                    }}
                                    onSubmit={(data) => {
                                        if (editingVariant) {
                                            updateMutation.mutate({ id: editingVariant.id, ...data });
                                        } else {
                                            createMutation.mutate(data);
                                        }
                                    }}
                                    isPending={createMutation.isPending || updateMutation.isPending}
                                />
                            )}

                            {variants.length === 0 && !showAddForm ? (
                                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                                    <p className="text-muted-foreground">No variants added yet.</p>
                                    <p className="text-xs text-muted-foreground mt-1">Add sizes like "Small", "Medium", "Large"</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Option Name / Size</TableHead>
                                            <TableHead>Color</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Stock</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                        <TableBody>
                                            {variants.map((v: any) => (
                                                <TableRow key={v.id}>
                                                    <TableCell className="font-medium">{v.name}</TableCell>
                                                    <TableCell>{v.color || "—"}</TableCell>
                                                    <TableCell className="font-mono">{formatPrice(v.price)}</TableCell>
                                                    <TableCell>{v.inventoryQuantity}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button variant="ghost" size="icon" onClick={() => setEditingVariant(v)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => {
                                                            if (confirm("Delete this variant?")) {
                                                                deleteMutation.mutate({ id: v.id });
                                                            }
                                                        }}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex justify-end pt-2 border-t">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function VariantForm({
    initialData,
    productId,
    onSubmit,
    onCancel,
    isPending,
}: {
    initialData?: any;
    productId: number;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isPending: boolean;
}) {
    const [name, setName] = useState(initialData?.name ?? "");
    const [size, setSize] = useState(initialData?.size ?? "");
    const [color, setColor] = useState(initialData?.color ?? "");
    const [sku, setSku] = useState(initialData?.sku ?? "");
    const [price, setPrice] = useState(initialData ? (initialData.price / 100).toFixed(2) : "");
    const [stock, setStock] = useState(initialData?.inventoryQuantity ?? 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            productId,
            name: name || size || "Default",
            size: size || undefined,
            color: color || undefined,
            sku: sku || undefined,
            price: Math.round(parseFloat(price) * 100),
            inventoryQuantity: parseInt(stock.toString()),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded-lg bg-muted/20 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase">Size / Option *</label>
                    <Input placeholder="Large, XL, etc." value={size} onChange={(e) => setSize(e.target.value)} required />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase">Color</label>
                    <Input placeholder="Black, White" value={color} onChange={(e) => setColor(e.target.value)} />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase">Price ($) *</label>
                    <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase">Stock</label>
                    <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase">Display Name</label>
                    <Input placeholder="e.g. XL / Black" value={name || (size && color ? `${size} / ${color}` : size)} readOnly className="bg-muted" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase">SKU</label>
                    <Input placeholder="Optional" value={sku} onChange={(e) => setSku(e.target.value)} />
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
                <Button type="submit" size="sm" disabled={isPending}>
                    {isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                    {initialData ? "Update Variant" : "Save Variant"}
                </Button>
            </div>
        </form>
    );
}
