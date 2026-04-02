import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  Loader2, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  X,
  CreditCard,
  CheckCircle2,
  PackageSearch
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { CartSidebar } from "@/components/CartSidebar";

/** Format cents → display price */
function formatPrice(cents: number) {
    return `$${(cents / 100).toFixed(2)}`;
}

export default function Shop() {
  const { data: products, isLoading } = trpc.shop.listProducts.useQuery();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { fulfillmentMode, setFulfillmentMode, paymentMode, setPaymentMode } = useCart();

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="container px-4 mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 mb-6 border rounded-full bg-primary/5 border-primary/20"
          >
            <ShoppingBag className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold tracking-widest uppercase text-primary">Official Store</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-5xl md:text-7xl font-heading font-black uppercase tracking-tighter mb-4"
          >
            Caspers <span className="text-primary italic">Merch</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto text-lg text-muted-foreground"
          >
            Quality gear for those who appreciate the perfect finish. 
            From premium apparel to gift certificates.
          </motion.p>
        </div>

        {/* Fulfillment Toggle */}
        <div className="flex justify-center mb-12">
            <div className="bg-muted/20 p-1.5 rounded-xl flex border border-white/5 space-x-2">
                <button 
                    onClick={() => { setFulfillmentMode("shipping"); setPaymentMode("invoice"); }} 
                    className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all 
                        ${fulfillmentMode === "shipping" ? "bg-primary text-black shadow-lg" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}
                >
                    🚚 Delivery
                </button>
                <button 
                    onClick={() => { setFulfillmentMode("pickup"); setPaymentMode("cash"); }} 
                    className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all 
                        ${fulfillmentMode === "pickup" ? "bg-primary text-black shadow-lg" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}
                >
                    🏪 Pickup In-Store
                </button>
            </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-muted-foreground animate-pulse font-heading uppercase tracking-widest text-sm">Fueling Up Shop...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!products || products.length === 0) && (
          <div className="text-center py-24 border border-dashed rounded-3xl bg-muted/5">
            <PackageSearch className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
            <h3 className="text-2xl font-bold mb-2">Restocking the shelves</h3>
            <p className="text-muted-foreground mb-8">We don't have any products available online right now. Check back soon!</p>
            <Button variant="outline" onClick={() => window.location.href = "/"}>Return Home</Button>
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products?.map((product, i) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              index={i} 
              onView={() => setSelectedProduct(product)}
            />
          ))}
        </div>
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailDialog
            product={selectedProduct}
            open={!!selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductCard({ product, index, onView }: { product: any; index: number; onView: () => void }) {
  const images = JSON.parse(product.images || "[]");
  const mainImage = images[0] || "https://images.unsplash.com/photo-1576007461368-c2666daeb264?w=800&q=80"; // Fallback paint splash

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group cursor-pointer relative"
      onClick={onView}
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl border bg-muted/20">
        {/* Badge */}
        {product.featured === 1 && (
            <div className="absolute top-4 left-4 z-10">
                <Badge className="bg-primary text-black font-black uppercase tracking-wider px-3 py-1">Featured</Badge>
            </div>
        )}
        
        {/* Image */}
        <img 
          src={mainImage} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
            <div className="flex items-center gap-2 text-white font-bold uppercase tracking-widest text-sm translate-y-4 group-hover:translate-y-0 transition-transform">
                View Details <ArrowRight className="w-4 h-4" />
            </div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-start">
        <div>
          <h3 className="text-xl font-heading font-bold uppercase truncate max-w-[200px]">{product.name}</h3>
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">{product.category || "General"}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-mono font-black text-primary">{formatPrice(product.basePrice)}</p>
          {product.compareAtPrice && (
            <p className="text-xs text-muted-foreground line-through decoration-red-500/50">{formatPrice(product.compareAtPrice)}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ProductDetailDialog({ product, open, onClose }: { product: any; open: boolean; onClose: () => void }) {
  const images = JSON.parse(product.images || "[]");
  const [activeImg, setActiveImg] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const { addToCart, fulfillmentMode, paymentMode } = useCart();
  const hideSizing = fulfillmentMode === "pickup" && paymentMode === "cash";
  
  const { data: detailData, isLoading: isDetailLoading } = trpc.shop.getProductBySlug.useQuery({ slug: product.slug });
  const variants = detailData?.variants ?? [];

  const handleAddToCart = () => {
    if (product.hasVariants === 1 && !selectedVariant && !hideSizing) {
        toast.error("Please select a size first");
        return;
    }
    
    addToCart({
        id: `${product.id}-${selectedVariant?.id || 'base'}`,
        productId: product.id,
        variantId: selectedVariant?.id,
        name: product.name,
        variantName: selectedVariant ? `${selectedVariant.size}` : undefined,
        price: selectedVariant ? selectedVariant.price : product.basePrice,
        image: images[0] || "https://images.unsplash.com/photo-1576007461368-c2666daeb264?w=800&q=80"
    });

    toast.success(`Added to cart!`, {
        description: `${product.name} ${selectedVariant ? `(${selectedVariant.size})` : ""} has been added to your bag.`,
        icon: <ShoppingBag className="w-4 h-4 text-green-500" />
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery Side */}
          <div className="relative bg-muted/20">
             <div className="aspect-square w-full relative">
                 <AnimatePresence mode="wait">
                    <motion.img
                        key={images[activeImg]}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        src={images[activeImg] || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80"}
                        className="w-full h-full object-cover"
                    />
                 </AnimatePresence>
                 
                 {images.length > 1 && (
                     <>
                        <button 
                            onClick={() => setActiveImg((prev) => (prev - 1 + images.length) % images.length)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-primary hover:text-black transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => setActiveImg((prev) => (prev + 1) % images.length)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-primary hover:text-black transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                     </>
                 )}
             </div>
             
             {/* Thumbs */}
             {images.length > 1 && (
                 <div className="flex gap-2 p-4 overflow-x-auto">
                     {images.map((img: string, i: number) => (
                         <div 
                            key={i}
                            onClick={() => setActiveImg(i)}
                            className={`w-16 h-16 rounded-lg border-2 cursor-pointer overflow-hidden transition-colors ${activeImg === i ? "border-primary" : "border-transparent opacity-60"}`}
                         >
                            <img src={img} className="w-full h-full object-cover" />
                         </div>
                     ))}
                 </div>
             )}
          </div>

          {/* Info Side */}
          <div className="p-8 flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-black">{product.category || "Merch"}</Badge>
                    {product.featured === 1 && <Badge className="bg-primary text-black text-[10px] uppercase font-black tracking-widest">Hot Item</Badge>}
                </div>
                
                <h2 className="text-4xl font-heading font-black uppercase tracking-tighter mb-2">{product.name}</h2>
                
                <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-3xl font-mono font-black text-primary">{formatPrice(product.basePrice)}</span>
                    {product.compareAtPrice && (
                        <span className="text-lg text-muted-foreground line-through italic px-2 bg-red-500/10 rounded">{formatPrice(product.compareAtPrice)}</span>
                    )}
                </div>

                <div className="prose prose-invert text-sm text-muted-foreground mb-8 line-clamp-4">
                    {product.description || "Fresh selection of premium automotive culture merchandise. This piece features high-quality materials and our signature Caspers design."}
                </div>

                {/* Sizing / Options */}
                {product.hasVariants === 1 && !hideSizing && (
                    <div className="space-y-4 mb-8">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-black uppercase tracking-widest">Select Size</label>
                            <span className="text-[10px] text-muted-foreground underline cursor-pointer">Sizing Guide</span>
                        </div>
                        
                        {isDetailLoading ? (
                             <div className="flex gap-2 animate-pulse">
                                {[1,2,3].map(n => <div key={n} className="w-12 h-10 bg-muted rounded-md" />)}
                             </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {variants.map((v: any) => (
                                    <button
                                        key={v.id}
                                        onClick={() => setSelectedVariant(v)}
                                        className={`min-w-[48px] h-10 px-3 rounded-md font-bold uppercase transition-all border-2 text-xs 
                                            ${selectedVariant?.id === v.id 
                                                ? "border-primary bg-primary text-black" 
                                                : "border-white/10 hover:border-primary/50"
                                            }`}
                                    >
                                        {v.size || v.name}
                                    </button>
                                ))}
                            </div>
                        )}
                        {!isDetailLoading && variants.length === 0 && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-300">
                                This item had options but none are currently configured. Check back soon.
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <Button 
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest text-lg group"
                    onClick={handleAddToCart}
                >
                    <ShoppingBag className="w-5 h-5 mr-3 group-hover:scale-125 transition-transform" />
                    Place in Bag
                </Button>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 p-3 rounded-lg border border-white/5 bg-white/5">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">In Stock</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg border border-white/5 bg-white/5">
                        <CreditCard className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Secure Pay</span>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
