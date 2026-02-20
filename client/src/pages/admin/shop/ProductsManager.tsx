import { useState } from "react";

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
                onClose={() => setShowCreateDialog(false)}
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data: any = {
            name,
            slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
            description: description || undefined,
            type,
            category: category || undefined,
            basePrice: Math.round(parseFloat(basePrice) * 100),
        };
        if (compareAtPrice) {
            data.compareAtPrice = Math.round(parseFloat(compareAtPrice) * 100);
        }
        onSubmit(data);
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <Input
                        placeholder="Slug"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        required
                    />
                    <textarea
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-y min-h-[80px]"
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-4">
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
                        <Input
                            placeholder="Category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Price ($)"
                            value={basePrice}
                            onChange={(e) => setBasePrice(e.target.value)}
                            required
                        />
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Compare At ($)"
                            value={compareAtPrice}
                            onChange={(e) => setCompareAtPrice(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
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
