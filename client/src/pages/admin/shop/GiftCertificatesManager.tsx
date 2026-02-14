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
import { Gift, Plus, Search, Loader2, Pencil } from "lucide-react";
import { format } from "date-fns";

function formatPrice(cents: number) {
    return `$${(cents / 100).toFixed(2)}`;
}

const STATUS_COLORS: Record<string, string> = {
    active: "bg-green-600/20 text-green-400 border-green-600/30",
    redeemed: "bg-blue-600/20 text-blue-400 border-blue-600/30",
    expired: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
    cancelled: "bg-red-600/20 text-red-400 border-red-600/30",
};

export default function GiftCertificatesManager() {
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingCert, setEditingCert] = useState<any>(null);

    const {
        data: certs,
        isLoading,
        refetch,
    } = trpc.shop.adminListGiftCertificates.useQuery();

    const createMutation = trpc.shop.createGiftCertificate.useMutation({
        onSuccess: () => {
            toast.success("Gift certificate created");
            setShowCreateDialog(false);
            refetch();
        },
        onError: (e) => toast.error(e.message),
    });

    const updateMutation = trpc.shop.updateGiftCertificate.useMutation({
        onSuccess: () => {
            toast.success("Gift certificate updated");
            setEditingCert(null);
            refetch();
        },
        onError: (e) => toast.error(e.message),
    });

    const filtered = certs?.filter(
        (c) =>
            c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.recipientName ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.recipientEmail ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeCount = certs?.filter((c) => c.status === "active").length ?? 0;
    const totalValue =
        certs?.reduce((sum, c) => sum + (c.status === "active" ? c.balance : 0), 0) ??
        0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">GIFT CERTIFICATES</h1>
                    <p className="text-muted-foreground">
                        Create and manage gift certificates
                    </p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Certificate
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold">{certs?.length ?? 0}</p>
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
                        <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                        <p className="text-2xl font-bold">{formatPrice(totalValue)}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by code, recipient name, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : !filtered?.length ? (
                        <div className="text-center py-12">
                            <Gift className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                            <p className="text-muted-foreground">No gift certificates yet</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-3"
                                onClick={() => setShowCreateDialog(true)}
                            >
                                Create your first certificate
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Recipient</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Balance</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((cert) => (
                                    <TableRow key={cert.id}>
                                        <TableCell className="font-mono text-sm">
                                            {cert.code}
                                        </TableCell>
                                        <TableCell>
                                            {cert.recipientName ? (
                                                <div>
                                                    <p className="font-medium">{cert.recipientName}</p>
                                                    {cert.recipientEmail && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {cert.recipientEmail}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {formatPrice(cert.amount)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {formatPrice(cert.balance)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={STATUS_COLORS[cert.status] ?? ""}>
                                                {cert.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {format(new Date(cert.createdAt), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setEditingCert(cert)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Create dialog */}
            <CreateCertDialog
                open={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
                onSubmit={(data) => createMutation.mutate(data)}
                isPending={createMutation.isPending}
            />

            {/* Edit dialog */}
            {editingCert && (
                <EditCertDialog
                    cert={editingCert}
                    onClose={() => setEditingCert(null)}
                    onSubmit={(data) =>
                        updateMutation.mutate({ id: editingCert.id, ...data })
                    }
                    isPending={updateMutation.isPending}
                />
            )}
        </div>
    );
}

/* ─── Create dialog ───────────────────────────────────────── */

function CreateCertDialog({
    open,
    onClose,
    onSubmit,
    isPending,
}: {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    isPending: boolean;
}) {
    const [amount, setAmount] = useState("");
    const [recipientName, setRecipientName] = useState("");
    const [recipientEmail, setRecipientEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            amount: Math.round(parseFloat(amount) * 100),
            recipientName: recipientName || undefined,
            recipientEmail: recipientEmail || undefined,
            message: message || undefined,
        });
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Create Gift Certificate</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Amount ($)"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                    <Input
                        placeholder="Recipient name (optional)"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                    />
                    <Input
                        type="email"
                        placeholder="Recipient email (optional)"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                    />
                    <textarea
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-y min-h-[60px]"
                        placeholder="Personal message (optional)"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending && (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            )}
                            Create Certificate
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

/* ─── Edit dialog (balance / status) ──────────────────────── */

function EditCertDialog({
    cert,
    onClose,
    onSubmit,
    isPending,
}: {
    cert: any;
    onClose: () => void;
    onSubmit: (data: any) => void;
    isPending: boolean;
}) {
    const [balance, setBalance] = useState((cert.balance / 100).toFixed(2));
    const [status, setStatus] = useState(cert.status);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            balance: Math.round(parseFloat(balance) * 100),
            status,
        });
    };

    return (
        <Dialog open onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Edit {cert.code}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm text-muted-foreground">
                            Original Amount: {formatPrice(cert.amount)}
                        </label>
                    </div>
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Remaining balance ($)"
                        value={balance}
                        onChange={(e) => setBalance(e.target.value)}
                        required
                    />
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="redeemed">Redeemed</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending && (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            )}
                            Save
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
