import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Eye, Loader2, Calendar, Mail, Phone, Car, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { getLoginUrl } from "@/const";

const statusColors = {
  new: "bg-blue-500",
  reviewed: "bg-yellow-500",
  quoted: "bg-purple-500",
  accepted: "bg-green-500",
  declined: "bg-red-500",
  completed: "bg-gray-500",
};

const statusLabels = {
  new: "New",
  reviewed: "Reviewed",
  quoted: "Quoted",
  accepted: "Accepted",
  declined: "Declined",
  completed: "Completed",
};

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null);

  const { data: quotes, isLoading, refetch } = trpc.quotes.list.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const { data: quoteDetail } = trpc.quotes.getById.useQuery(
    { id: selectedQuoteId! },
    { enabled: !!selectedQuoteId }
  );

  const updateStatus = trpc.quotes.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Redirect if not logged in or not admin
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-heading font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Filter quotes
  const filteredQuotes = quotes?.filter((quote) => {
    const matchesSearch =
      quote.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.vehicleType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (quoteId: number, newStatus: string) => {
    updateStatus.mutate({
      id: quoteId,
      status: newStatus as any,
    });
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-4xl md:text-5xl uppercase mb-2">
            Quote <span className="text-primary">Dashboard</span>
          </h1>
          <p className="text-muted-foreground">Manage and track all customer quote requests</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="quoted">Quoted</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          {Object.entries(statusLabels).map(([status, label]) => {
            const count = quotes?.filter((q) => q.status === status).length || 0;
            return (
              <div key={status} className="bg-card border border-border p-4 rounded-lg">
                <div className="text-2xl font-bold mb-1">{count}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredQuotes && filteredQuotes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell>
                      <div className="font-medium">{quote.name}</div>
                      <div className="text-xs text-muted-foreground">{quote.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-muted-foreground" />
                        <span className="capitalize">{quote.vehicleType}</span>
                      </div>
                      {quote.vehicleMake && (
                        <div className="text-xs text-muted-foreground">
                          {quote.vehicleMake} {quote.vehicleModel}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-muted-foreground" />
                        <span className="capitalize">{quote.serviceType.replace("-", " ")}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={quote.status}
                        onValueChange={(value) => handleStatusChange(quote.id, value)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <Badge className={cn("text-white", statusColors[quote.status])}>
                            {statusLabels[quote.status]}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {format(new Date(quote.createdAt), "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedQuoteId(quote.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {searchTerm || statusFilter !== "all"
                ? "No quotes match your filters"
                : "No quote submissions yet"}
            </div>
          )}
        </div>
      </div>

      {/* Quote Detail Modal */}
      <Dialog open={!!selectedQuoteId} onOpenChange={() => setSelectedQuoteId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {quoteDetail && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl uppercase">
                  Quote #{quoteDetail.quote.id}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="font-heading font-bold uppercase mb-3">Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Mail className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Name</div>
                        <div className="font-medium">{quoteDetail.quote.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Mail className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Email</div>
                        <div className="font-medium">{quoteDetail.quote.email}</div>
                      </div>
                    </div>
                    {quoteDetail.quote.phone && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Phone className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Phone</div>
                          <div className="font-medium">{quoteDetail.quote.phone}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vehicle Info */}
                <div>
                  <h3 className="font-heading font-bold uppercase mb-3">Vehicle Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Type</div>
                      <div className="font-medium capitalize">{quoteDetail.quote.vehicleType}</div>
                    </div>
                    {quoteDetail.quote.vehicleMake && (
                      <div>
                        <div className="text-xs text-muted-foreground">Make & Model</div>
                        <div className="font-medium">
                          {quoteDetail.quote.vehicleMake} {quoteDetail.quote.vehicleModel}
                        </div>
                      </div>
                    )}
                    {quoteDetail.quote.vehicleYear && (
                      <div>
                        <div className="text-xs text-muted-foreground">Year</div>
                        <div className="font-medium">{quoteDetail.quote.vehicleYear}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Service Info */}
                <div>
                  <h3 className="font-heading font-bold uppercase mb-3">Service Request</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Service Type</div>
                      <div className="font-medium capitalize">
                        {quoteDetail.quote.serviceType.replace("-", " ")}
                      </div>
                    </div>
                    {quoteDetail.quote.paintFinish && (
                      <div>
                        <div className="text-xs text-muted-foreground">Paint Finish</div>
                        <div className="font-medium capitalize">{quoteDetail.quote.paintFinish}</div>
                      </div>
                    )}
                    {quoteDetail.quote.budget && (
                      <div>
                        <div className="text-xs text-muted-foreground">Budget</div>
                        <div className="font-medium">{quoteDetail.quote.budget}</div>
                      </div>
                    )}
                    {quoteDetail.quote.timeline && (
                      <div>
                        <div className="text-xs text-muted-foreground">Timeline</div>
                        <div className="font-medium">{quoteDetail.quote.timeline}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {quoteDetail.quote.description && (
                  <div>
                    <h3 className="font-heading font-bold uppercase mb-3">Project Description</h3>
                    <p className="text-sm text-muted-foreground bg-muted p-4 rounded">
                      {quoteDetail.quote.description}
                    </p>
                  </div>
                )}

                {/* Uploaded Files */}
                {quoteDetail.files.length > 0 && (
                  <div>
                    <h3 className="font-heading font-bold uppercase mb-3">
                      Uploaded Photos ({quoteDetail.files.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {quoteDetail.files.map((file) => (
                        <a
                          key={file.id}
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative aspect-video rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
                        >
                          <img
                            src={file.fileUrl}
                            alt={file.fileName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="w-6 h-6 text-white" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
