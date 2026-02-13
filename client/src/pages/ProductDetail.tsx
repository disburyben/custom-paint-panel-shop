import { trpc } from "@/lib/trpc";
import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowLeft, Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import NotFound from "./NotFound";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ProductDetail() {
    const [match, params] = useRoute("/shop/product/:slug");
    const slug = params?.slug;

    const { data: product, isLoading } = trpc.shop.products.get.useQuery(
        { slug: slug || "" },
        { enabled: !!slug }
    );

    const checkoutMutation = trpc.shop.checkout.createSession.useMutation({
        onSuccess: (data) => {
            window.location.href = data.url!;
        },
        onError: (error) => {
            toast.error(error.message);
            setIsCheckingOut(false);
        }
    });

    const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");

    // Gift Certificate fields
    const [recipientName, setRecipientName] = useState("");
    const [recipientEmail, setRecipientEmail] = useState("");
    const [message, setMessage] = useState("");

    const isCheckingOut = checkoutMutation.isPending;

    if (!slug) return <NotFound />;
    if (isLoading) return <div className="pt-32 pb-20 text-center">Loading...</div>;
    if (!product) return <NotFound />;

    const images = product.images ? JSON.parse(product.images as string) : [];
    const currentImage = images[0] || "";

    // Helper to format price
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-AU', {
            style: 'currency',
            currency: 'AUD'
        }).format(price / 100);
    };

    const handleCheckout = () => {
        checkoutMutation.mutate({
            items: [{
                productId: product.id,
                variantId: selectedVariant,
                quantity: quantity
            }],
            customerEmail,
            customerName,
            giftRecipient: product.type === 'gift_certificate' ? {
                name: recipientName,
                email: recipientEmail,
                message: message
            } : undefined
        });
    };

    return (
        <div className="pt-24 pb-20">
            <div className="container">
                <Link href="/shop">
                    <Button variant="link" className="mb-8 pl-0 text-muted-foreground hover:text-primary gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Shop
                    </Button>
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-card border border-border overflow-hidden relative group">
                            {currentImage ? (
                                <img
                                    src={currentImage}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-secondary">
                                    <ShoppingBag className="w-24 h-24 text-muted-foreground/50" />
                                </div>
                            )}
                        </div>
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-4">
                                {images.map((img: string, idx: number) => (
                                    <div key={idx} className="aspect-square bg-card border border-border cursor-pointer hover:border-primary transition-colors">
                                        <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        <h1 className="font-heading font-bold text-4xl md:text-5xl uppercase mb-2">{product.name}</h1>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-2xl font-bold text-primary">
                                {formatPrice(product.basePrice)}
                            </span>
                            {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
                                <span className="text-lg text-muted-foreground line-through">
                                    {formatPrice(product.compareAtPrice)}
                                </span>
                            )}
                            {product.trackInventory && product.inventoryQuantity! > 0 && (
                                <span className="bg-primary/10 text-primary text-xs font-bold uppercase px-2 py-1 rounded-sm">
                                    In Stock
                                </span>
                            )}
                        </div>

                        <div className="prose prose-invert text-muted-foreground mb-8">
                            <p>{product.description}</p>
                        </div>

                        {/* Variants */}
                        {product.hasVariants === 1 && product.variants && product.variants.length > 0 && (
                            <div className="mb-8">
                                <label className="block text-sm font-bold uppercase mb-2">Options</label>
                                <div className="flex flex-wrap gap-3">
                                    {product.variants.map((variant: any) => (
                                        <button
                                            key={variant.id}
                                            onClick={() => setSelectedVariant(variant.id)}
                                            className={`px-4 py-2 border text-sm uppercase transition-all ${selectedVariant === variant.id
                                                ? "border-primary bg-primary text-primary-foreground"
                                                : "border-border hover:border-primary/50 text-muted-foreground"
                                                }`}
                                        >
                                            {variant.name}
                                            {variant.price !== product.basePrice && ` (${formatPrice(variant.price)})`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Gift Certificate Fields */}
                        {product.type === 'gift_certificate' && (
                            <div className="space-y-4 mb-8 p-6 bg-secondary/20 border border-primary/20 rounded-sm">
                                <h3 className="font-heading font-bold uppercase text-lg mb-4 text-primary">Recipient Details</h3>
                                <div>
                                    <label className="block text-sm font-bold uppercase mb-2">Recipient Name</label>
                                    <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="e.g. John Doe" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold uppercase mb-2">Recipient Email</label>
                                    <Input type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="e.g. john@example.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold uppercase mb-2">Message</label>
                                    <textarea
                                        className="w-full bg-background border border-border px-3 py-2 rounded-sm h-24 text-sm"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Your message..."
                                    />
                                </div>
                            </div>
                        )}

                        {/* Checkout Dialog */}
                        <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Checkout</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Full Name" />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="email@example.com" />
                                    </div>
                                    <Button onClick={handleCheckout} disabled={isCheckingOut || !customerName || !customerEmail} className="w-full">
                                        {isCheckingOut ? "Redirecting..." : "Proceed to Payment"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>

                        {/* Quantity & Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <div className="flex items-center border border-border w-fit">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-3 hover:bg-secondary transition-colors"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-12 text-center font-bold">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="p-3 hover:bg-secondary transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <Button
                                onClick={() => setIsCheckoutOpen(true)}
                                disabled={!product.inventoryQuantity && product.trackInventory || (product.hasVariants === 1 && !selectedVariant)}
                                className="flex-1 font-heading uppercase tracking-wider h-auto py-3 text-lg"
                            >
                                {product.inventoryQuantity === 0 && product.trackInventory ? "Out of Stock" : "Buy Now"}
                            </Button>
                        </div>

                        <div className="bg-secondary/50 p-4 rounded-sm border border-border/50 text-sm text-muted-foreground space-y-2">
                            <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-primary" />
                                <span>Secure Checkout with Stripe</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-primary" />
                                <span>Caspers Quality Guarantee</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
