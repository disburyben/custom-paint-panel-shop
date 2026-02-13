import { Link, useSearch } from "wouter";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ShopSuccess() {
    const search = useSearch();
    const params = new URLSearchParams(search);
    const orderNumber = params.get("order");

    return (
        <div className="min-h-[80vh] flex items-center justify-center pt-24 pb-20">
            <div className="container max-w-lg text-center">
                <div className="mb-8 flex justify-center">
                    <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-12 h-12 text-primary" />
                    </div>
                </div>

                <h1 className="font-heading font-bold text-4xl uppercase mb-4">Order Confirmed!</h1>

                <p className="text-muted-foreground text-lg mb-8">
                    Thank you for your purchase.
                    {orderNumber && (
                        <span> Your order number is <span className="text-foreground font-bold">{orderNumber}</span>.</span>
                    )}
                    <br />
                    We've sent a confirmation email with all the details.
                </p>

                <div className="space-y-4">
                    <Link href="/shop">
                        <Button className="font-heading uppercase tracking-wider w-full gap-2">
                            Continue Shopping <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                    <Link href="/">
                        <Button variant="outline" className="font-heading uppercase tracking-wider w-full">
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
