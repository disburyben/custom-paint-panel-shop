import React, { useState } from "react";
import { X, ShoppingBag, Plus, Minus, Trash2, CreditCard, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

function formatPrice(cents: number) {
    return `$${(cents / 100).toFixed(2)}`;
}

export function CartSidebar({ children }: { children: React.ReactNode }) {
    const { items, totalAmount, totalCount, updateQuantity, removeFromCart, clearCart, fulfillmentMode, paymentMode } = useCart();
    const [open, setOpen] = useState(false);
    const [checkoutStep, setCheckoutStep] = useState<"cart" | "info" | "success">("cart");
    
    // Form state for basic checkout
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");

    const createOrder = trpc.shop.createOrder.useMutation({
        onSuccess: () => {
            setCheckoutStep("success");
            clearCart();
            toast.success("Order placed successfully!");
        },
        onError: (err) => {
            toast.error(`Order failed: ${err.message}`);
        }
    });

    const handleCheckout = async () => {
        if (!email || !name || (fulfillmentMode === "shipping" && !address)) {
            toast.error("Please fill in all contact details");
            return;
        }

        const orderData = {
            customerName: name,
            customerEmail: email,
            shippingAddress: address,
            totalAmount: totalAmount,
            items: JSON.stringify(items.map(i => ({
                productId: i.productId,
                variantId: i.variantId,
                name: i.name,
                variantName: i.variantName,
                price: i.price,
                quantity: i.quantity
            })))
        };

        createOrder.mutate({ 
            ...orderData, 
            shippingMethod: fulfillmentMode, 
            paymentMethod: paymentMode 
        });
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-background/95 backdrop-blur-xl border-white/5">
                <SheetHeader className="flex flex-row items-center justify-between border-b pb-4 mb-4">
                    <SheetTitle className="text-2xl font-heading font-black uppercase tracking-tighter flex items-center gap-2">
                        {checkoutStep === "success" ? "Thank You" : "Your Bag"}
                        <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full ml-2">
                            {totalCount}
                        </span>
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto pr-2">
                    <AnimatePresence mode="wait">
                        {checkoutStep === "cart" && (
                            <motion.div 
                                key="cart"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                {items.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                                        <ShoppingBag className="w-16 h-16 mb-4" />
                                        <p className="font-heading uppercase tracking-widest text-sm">Your bag is empty</p>
                                    </div>
                                ) : (
                                    items.map((item) => (
                                        <div key={item.id} className="flex gap-4 group">
                                            <div className="w-20 h-20 rounded-lg overflow-hidden border bg-muted/20 flex-shrink-0">
                                                <img src={item.image} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2">
                                                    <div>
                                                        <h4 className="font-bold uppercase text-sm truncate">{item.name}</h4>
                                                        {item.variantName && (
                                                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{item.variantName}</p>
                                                        )}
                                                    </div>
                                                    <span className="font-mono font-bold text-primary">{formatPrice(item.price * item.quantity)}</span>
                                                </div>
                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="flex items-center border rounded-md h-8 bg-muted/10">
                                                        <button 
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                            className="px-2 hover:text-primary transition-colors"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="px-2 font-mono text-xs font-bold w-8 text-center">{item.quantity}</span>
                                                        <button 
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                            className="px-2 hover:text-primary transition-colors"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <button 
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-muted-foreground hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </motion.div>
                        )}

                        {checkoutStep === "info" && (
                            <motion.div 
                                key="info"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6 p-1"
                            >
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-primary">Contact Details</h4>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Full Name</label>
                                        <input 
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className="w-full bg-muted/20 border border-white/10 rounded-md px-4 py-3 text-sm focus:border-primary outline-none transition-colors"
                                            placeholder="Casper Ghost"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Email Address</label>
                                        <input 
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="w-full bg-muted/20 border border-white/10 rounded-md px-4 py-3 text-sm focus:border-primary outline-none transition-colors"
                                            placeholder="casper@paintshop.com.au"
                                            type="email"
                                        />
                                    </div>
                                    {fulfillmentMode === "shipping" && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-bold text-muted-foreground">Shipping Address</label>
                                            <textarea 
                                                value={address}
                                                onChange={e => setAddress(e.target.value)}
                                                className="w-full bg-muted/20 border border-white/10 rounded-md px-4 py-3 text-sm focus:border-primary outline-none transition-colors min-h-[100px]"
                                                placeholder="123 Paint St, Melbourne VIC 3000"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CreditCard className="w-4 h-4 text-primary" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Payment Method</span>
                                    </div>
                                    {paymentMode === "cash" ? (
                                        <>
                                            <p className="text-[10px] text-muted-foreground mb-4">Pay securely in-store when picking up your order.</p>
                                            <div className="flex items-center gap-2 px-3 py-2 bg-primary/20 border border-primary/30 rounded-md">
                                                <span className="text-[10px] font-black uppercase text-primary">Pay in Cash</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-[10px] text-muted-foreground mb-4">You will receive an invoice via email once the order is confirmed by our team.</p>
                                            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border rounded-md grayscale opacity-50">
                                                <span className="text-[10px] font-black uppercase">Stripe / Card (Coming Soon)</span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <Button 
                                    className="w-full" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setCheckoutStep("cart")}
                                >
                                    Back to Cart
                                </Button>
                            </motion.div>
                        )}

                        {checkoutStep === "success" && (
                            <motion.div 
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-20 text-center"
                            >
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                                    <ShoppingBag className="w-10 h-10 text-primary" />
                                </div>
                                <h3 className="text-3xl font-heading font-black uppercase tracking-tighter mb-4">Order Received!</h3>
                                <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-8">
                                    We've received your request. Our team will verify stock and contact you shortly at <strong>{email}</strong> for payment and shipping.
                                </p>
                                <Button 
                                    className="w-full font-black uppercase tracking-widest"
                                    onClick={() => {
                                        setOpen(false);
                                        setTimeout(() => setCheckoutStep("cart"), 500);
                                    }}
                                >
                                    Continue Shopping
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {items.length > 0 && checkoutStep !== "success" && (
                    <div className="border-t pt-6 mt-6 space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Subtotal</span>
                            <span className="text-2xl font-mono font-black text-primary">{formatPrice(totalAmount)}</span>
                        </div>
                        
                        {checkoutStep === "cart" ? (
                            <Button 
                                className="w-full h-14 bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest group"
                                onClick={() => setCheckoutStep("info")}
                            >
                                Proceed to Checkout
                                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        ) : (
                            <Button 
                                className="w-full h-14 bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest group"
                                onClick={handleCheckout}
                                disabled={createOrder.isPending}
                            >
                                {createOrder.isPending ? "Processing..." : "Confirm Order"}
                                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        )}
                        
                        <p className="text-[10px] text-center text-muted-foreground uppercase font-bold tracking-widest py-2">
                           Free shipping on orders over $150
                        </p>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
