import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import {
    FileText,
    Package,
    CreditCard,
    Users,
    Newspaper,
    Images,
    MessageSquareQuote,
    ArrowRight,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
    ShoppingCart,
    Gift,
    Loader2,
} from "lucide-react";

export default function AdminDashboard() {
    // Single consolidated stats query
    const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery(undefined, {
        retry: false,
    });

    // Recent activity
    const { data: activity } = trpc.dashboard.recentActivity.useQuery(undefined, {
        retry: false,
    });

    const recentQuotes = activity?.recentQuotes ?? [];

    const statsCards = [
        {
            title: "Total Quotes",
            value: stats?.quotes.total ?? 0,
            description: `${stats?.quotes.new ?? 0} new, ${stats?.quotes.reviewed ?? 0} reviewed`,
            icon: FileText,
            href: "/admin/quotes",
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
        },
        {
            title: "Products",
            value: stats?.products.total ?? 0,
            description: `${stats?.products.active ?? 0} active`,
            icon: Package,
            href: "/admin/shop/products",
            color: "text-indigo-500",
            bgColor: "bg-indigo-500/10",
        },
        {
            title: "Orders",
            value: stats?.orders.total ?? 0,
            description: `${stats?.orders.pending ?? 0} pending`,
            icon: ShoppingCart,
            href: "/admin/shop/orders",
            color: "text-cyan-500",
            bgColor: "bg-cyan-500/10",
        },
        {
            title: "Blog Posts",
            value: stats?.blog.total ?? 0,
            description: `${stats?.blog.published ?? 0} published`,
            icon: Newspaper,
            href: "/admin/cms/blog",
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
        },
        {
            title: "Gallery Items",
            value: stats?.gallery.total ?? 0,
            description: "Before/after showcases",
            icon: Images,
            href: "/admin/cms/gallery",
            color: "text-green-500",
            bgColor: "bg-green-500/10",
        },
        {
            title: "Team Members",
            value: stats?.team.total ?? 0,
            description: "Active sprayers",
            icon: Users,
            href: "/admin/team",
            color: "text-orange-500",
            bgColor: "bg-orange-500/10",
        },
        {
            title: "Testimonials",
            value: stats?.testimonials.total ?? 0,
            description: (stats?.testimonials.pending ?? 0) > 0 ? `${stats?.testimonials.pending} pending approval` : "All approved",
            icon: MessageSquareQuote,
            href: "/admin/cms/testimonials",
            color: "text-amber-500",
            bgColor: "bg-amber-500/10",
        },
        {
            title: "Gift Certificates",
            value: stats?.giftCertificates.total ?? 0,
            description: `${stats?.giftCertificates.active ?? 0} active`,
            icon: Gift,
            href: "/admin/shop/gift-certificates",
            color: "text-rose-500",
            bgColor: "bg-rose-500/10",
        },
        {
            title: "Services",
            value: stats?.services.total ?? 0,
            description: "Active services",
            icon: CreditCard,
            href: "/admin/cms/services",
            color: "text-teal-500",
            bgColor: "bg-teal-500/10",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    Welcome back. Here's an overview of your shop.
                </p>
            </div>

            {/* Stats Grid */}
            {statsLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {statsCards.map((stat) => (
                        <Link key={stat.href} href={stat.href}>
                            <Card className="p-5 hover:border-primary/30 transition-all cursor-pointer group hover:shadow-md">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                        <p className="text-3xl font-bold tabular-nums">{stat.value}</p>
                                        <p className="text-xs text-muted-foreground">{stat.description}</p>
                                    </div>
                                    <div className={`${stat.bgColor} ${stat.color} rounded-lg p-2.5`}>
                                        <stat.icon className="size-5" />
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            {/* Two Column Layout: Recent Quotes + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Recent Quotes */}
                <Card className="lg:col-span-3 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Clock className="size-4 text-muted-foreground" />
                            <h2 className="text-lg font-semibold">Recent Quotes</h2>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/quotes">
                                View all <ArrowRight className="ml-1 size-3.5" />
                            </Link>
                        </Button>
                    </div>

                    {recentQuotes.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <FileText className="size-10 mx-auto mb-3 opacity-40" />
                            <p className="text-sm">No quotes yet</p>
                            <p className="text-xs mt-1">Quote requests will appear here</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentQuotes.map((quote) => (
                                <div
                                    key={quote.id}
                                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="flex-shrink-0">
                                            {quote.status === "new" ? (
                                                <AlertCircle className="size-4 text-blue-500" />
                                            ) : quote.status === "completed" ? (
                                                <CheckCircle2 className="size-4 text-green-500" />
                                            ) : (
                                                <TrendingUp className="size-4 text-amber-500" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{quote.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {quote.vehicleType} · {quote.serviceType}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <StatusBadge status={quote.status} />
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {formatRelativeTime(quote.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Quick Actions */}
                <Card className="lg:col-span-2 p-6">
                    <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                    <div className="space-y-2">
                        {[
                            { label: "Manage Quotes", href: "/admin/quotes", icon: FileText },
                            { label: "View Products", href: "/admin/shop/products", icon: Package },
                            { label: "View Orders", href: "/admin/shop/orders", icon: ShoppingCart },
                            { label: "Write Blog Post", href: "/admin/cms/blog", icon: Newspaper },
                            { label: "Add Gallery Item", href: "/admin/cms/gallery", icon: Images },
                            { label: "Manage Team", href: "/admin/team", icon: Users },
                            { label: "Gift Certificates", href: "/admin/shop/gift-certificates", icon: Gift },
                            { label: "Business Info", href: "/admin/cms/business-info", icon: CreditCard },
                        ].map((action) => (
                            <Button
                                key={action.href}
                                variant="ghost"
                                className="w-full justify-start h-10"
                                asChild
                            >
                                <Link href={action.href}>
                                    <action.icon className="mr-2 size-4 text-muted-foreground" />
                                    {action.label}
                                    <ArrowRight className="ml-auto size-3.5 text-muted-foreground" />
                                </Link>
                            </Button>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        new: "default",
        reviewed: "secondary",
        quoted: "outline",
        accepted: "default",
        declined: "destructive",
        completed: "secondary",
    };

    return (
        <Badge variant={variants[status] ?? "outline"} className="text-[10px] capitalize">
            {status}
        </Badge>
    );
}

function formatRelativeTime(dateString: string | Date): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}
