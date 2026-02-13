import { Link } from "wouter";
import { XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ShopCancel() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center pt-24 pb-20">
            <div className="container max-w-lg text-center">
                <div className="mb-8 flex justify-center">
                    <div className="w-24 h-24 bg-destructive/20 rounded-full flex items-center justify-center">
                        <XCircle className="w-12 h-12 text-destructive" />
                    </div>
                </div>

                <h1 className="font-heading font-bold text-4xl uppercase mb-4">Order Cancelled</h1>

                <p className="text-muted-foreground text-lg mb-8">
                    Your payment was cancelled and no charges were made.
                    <br />
                    If you experienced an issue, please try again or contact us.
                </p>

                <div className="space-y-4">
                    <Link href="/shop">
                        <Button className="font-heading uppercase tracking-wider w-full gap-2">
                            <ArrowLeft className="w-4 h-4" /> Return to Shop
                        </Button>
                    </Link>
                    <Link href="/contact">
                        <Button variant="outline" className="font-heading uppercase tracking-wider w-full">
                            Contact Support
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
