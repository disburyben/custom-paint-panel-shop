import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
    ShoppingCart,
    Search,
    Loader2,
    Eye,
    Truck,
    Package,
} from "lucide-react";
import { format } from "date-fns";

function formatPrice(cents: number) {
    return `$${(cents / 100).toFixed(2)}`;
}

const STATUS_COLORS: Record<string, string> = {
    pending: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
    processing: "bg-blue-600/20 text-blue-400 border-blue-600/30",
    shipped: "bg-purple-600/20 text-purple-400 border-purple-600/30",
    delivered: "bg-green-600/20 text-green-400 border-green-600/30",
    cancelled: "bg-red-600/20 text-red-400 border-red-600/30",
};

const PAYMENT_COLORS: Record<string, string> = {
    pending: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
    paid: "bg-green-600/20 text-green-400 border-green-600/30",
    failed: "bg-red-600/20 text-red-400 border-red-600/30",
    refunded: "bg-gray-600/20 text-gray-400 border-gray-600/30",
};

export default function OrdersManager() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

    const { data: orders, isLoading, refetch } = trpc.shop.adminListOrders.useQuery();

    const updateMutation = trpc.shop.updateOrder.useMutation({
        onSuccess: () => {
            toast.success("Order updated");
            refetch();
        },
        onError: (e) => toast.error(e.message),
    });

    const filtered = orders?.filter((o) => {
        const matchSearch =
            o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === "all" || o.status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">ORDERS</h1>
                <p className="text-muted-foreground">
                    View and manage customer orders
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {(["pending", "processing", "shipped", "delivered", "cancelled"] as const).map(
                    (s) => {
                        const count = orders?.filter((o) => o.status === s).length ?? 0;
                        return (
                            <Card
                                key={s}
                                className={`cursor-pointer transition-colors ${statusFilter === s ? "ring-2 ring-primary" : ""
                                    }`}
                                onClick={() =>
                                    setStatusFilter(statusFilter === s ? "all" : s)
                                }
                            >
                                <CardContent className="p-3 text-center">
                                    <p className="text-2xl font-bold">{count}</p>
                                    <p className="text-xs text-muted-foreground uppercase">
                                        {s}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    }
                )}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by order #, name, or email..."
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
                            <ShoppingCart className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                            <p className="text-muted-foreground">No orders yet</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order #</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead>Payment</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-mono text-sm">
                                            {order.orderNumber}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{order.customerName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {order.customerEmail}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {formatPrice(order.total)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={
                                                    PAYMENT_COLORS[order.paymentStatus] ?? ""
                                                }
                                            >
                                                {order.paymentStatus}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={STATUS_COLORS[order.status] ?? ""}
                                            >
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {format(new Date(order.createdAt), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setSelectedOrderId(order.id)}
                                                title="View details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Order detail dialog */}
            {selectedOrderId && (
                <OrderDetailDialog
                    orderId={selectedOrderId}
                    onClose={() => setSelectedOrderId(null)}
                    onUpdate={(data) => {
                        updateMutation.mutate({ id: selectedOrderId, ...data });
                    }}
                    isPending={updateMutation.isPending}
                />
            )}
        </div>
    );
}

/* ─── Order detail dialog ─────────────────────────────────── */

function OrderDetailDialog({
    orderId,
    onClose,
    onUpdate,
    isPending,
}: {
    orderId: number;
    onClose: () => void;
    onUpdate: (data: any) => void;
    isPending: boolean;
}) {
    const { data, isLoading } = trpc.shop.adminGetOrder.useQuery({ id: orderId });
    const [status, setStatus] = useState("");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [shippingCarrier, setShippingCarrier] = useState("");

    // Sync state when data loads
    if (data && !status) {
        setStatus(data.order.status);
        setTrackingNumber(data.order.trackingNumber ?? "");
        setShippingCarrier(data.order.shippingCarrier ?? "");
    }

    return (
        <Dialog open onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Order {data?.order.orderNumber ?? "..."}
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : data ? (
                    <div className="space-y-6">
                        {/* Customer info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Customer</p>
                                <p className="font-medium">{data.order.customerName}</p>
                                <p className="text-sm">{data.order.customerEmail}</p>
                                {data.order.customerPhone && (
                                    <p className="text-sm">{data.order.customerPhone}</p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Totals</p>
                                <p className="text-sm">
                                    Subtotal: {formatPrice(data.order.subtotal)}
                                </p>
                                <p className="text-sm">
                                    Shipping: {formatPrice(data.order.shippingCost)}
                                </p>
                                <p className="font-bold">
                                    Total: {formatPrice(data.order.total)}
                                </p>
                            </div>
                        </div>

                        {/* Items */}
                        {data.items.length > 0 && (
                            <div>
                                <p className="text-sm font-medium mb-2">Items</p>
                                <div className="border rounded-md divide-y">
                                    {data.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex justify-between items-center p-3"
                                        >
                                            <div>
                                                <p className="font-medium">{item.productName}</p>
                                                {item.variantName && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.variantName}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right text-sm">
                                                <p>
                                                    {item.quantity} × {formatPrice(item.price)}
                                                </p>
                                                <p className="font-medium">
                                                    {formatPrice(item.total)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Status + tracking update */}
                        <div className="space-y-3 border-t pt-4">
                            <p className="text-sm font-medium flex items-center gap-2">
                                <Truck className="h-4 w-4" /> Fulfillment
                            </p>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="shipped">Shipped</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    placeholder="Tracking number"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                />
                                <Input
                                    placeholder="Carrier (e.g. AusPost)"
                                    value={shippingCarrier}
                                    onChange={(e) => setShippingCarrier(e.target.value)}
                                />
                            </div>
                            <Button
                                className="w-full"
                                onClick={() =>
                                    onUpdate({
                                        status,
                                        trackingNumber: trackingNumber || undefined,
                                        shippingCarrier: shippingCarrier || undefined,
                                    })
                                }
                                disabled={isPending}
                            >
                                {isPending && (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                )}
                                Update Order
                            </Button>
                        </div>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
