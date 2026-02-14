import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    FileText,
    ShoppingBag,
    Package,
    CreditCard,
    Gift,
    Newspaper,
    MessageSquareQuote,
    Wrench,
    Images,
    Building2,
    Users,
    ChevronRight,
    LogOut,
    Paintbrush,
    BarChart3,
} from "lucide-react";
import { toast } from "sonner";

interface AdminLayoutProps {
    children: React.ReactNode;
}

// Navigation structure
const navItems = [
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/admin",
    },
    {
        title: "Quotes",
        icon: FileText,
        href: "/admin/quotes",
    },
    {
        title: "Shop",
        icon: ShoppingBag,
        children: [
            { title: "Products", icon: Package, href: "/admin/shop/products" },
            { title: "Orders", icon: CreditCard, href: "/admin/shop/orders" },
            { title: "Gift Certificates", icon: Gift, href: "/admin/shop/gift-certificates" },
        ],
    },
    {
        title: "Content",
        icon: Newspaper,
        children: [
            { title: "Blog Posts", icon: Newspaper, href: "/admin/cms/blog" },
            { title: "Testimonials", icon: MessageSquareQuote, href: "/admin/cms/testimonials" },
            { title: "Services", icon: Wrench, href: "/admin/cms/services" },
            { title: "Gallery", icon: Images, href: "/admin/cms/gallery" },
            { title: "Business Info", icon: Building2, href: "/admin/cms/business-info" },
            { title: "Analytics", icon: BarChart3, href: "/admin/cms/analytics" },
        ],
    },
    {
        title: "Team",
        icon: Users,
        href: "/admin/team",
    },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [location, setLocation] = useLocation();
    const authCheck = trpc.adminAuth.check.useQuery();
    const logoutMutation = trpc.adminAuth.logout.useMutation({
        onSuccess: () => {
            toast.success("Logged out successfully");
            setLocation("/admin/login");
        },
    });

    // Redirect to login if not authenticated
    useEffect(() => {
        if (authCheck.isLoading) return;
        if (!authCheck.data?.authenticated) {
            setLocation("/admin/login");
        }
    }, [authCheck.isLoading, authCheck.data, setLocation]);

    if (authCheck.isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Loading admin...</p>
                </div>
            </div>
        );
    }

    if (!authCheck.data?.authenticated) {
        return null; // Will redirect via useEffect
    }

    return (
        <SidebarProvider>
            <Sidebar variant="inset" collapsible="icon">
                {/* Logo / Brand */}
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href="/admin">
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-orange-600 text-white">
                                        <Paintbrush className="size-4" />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">Caspers Admin</span>
                                        <span className="truncate text-xs text-muted-foreground">Panel Management</span>
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <Separator />

                {/* Navigation */}
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {navItems.map((item) =>
                                    item.children ? (
                                        <CollapsibleNavItem
                                            key={item.title}
                                            item={item}
                                            currentPath={location}
                                        />
                                    ) : (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={location === item.href}
                                                tooltip={item.title}
                                            >
                                                <Link href={item.href!}>
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                )}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                {/* Footer */}
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                tooltip="Log out"
                                onClick={() => logoutMutation.mutate()}
                            >
                                <LogOut />
                                <span>Log Out</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>

                <SidebarRail />
            </Sidebar>

            <SidebarInset>
                {/* Top bar */}
                <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <AdminBreadcrumb currentPath={location} />
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-auto p-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}

// Collapsible nav group for items with children
function CollapsibleNavItem({
    item,
    currentPath,
}: {
    item: (typeof navItems)[number];
    currentPath: string;
}) {
    const isChildActive = item.children?.some((child) => currentPath === child.href);
    const [open, setOpen] = useState(isChildActive ?? false);

    return (
        <Collapsible open={open} onOpenChange={setOpen}>
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title} isActive={isChildActive}>
                        <item.icon />
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {item.children?.map((child) => (
                            <SidebarMenuSubItem key={child.href}>
                                <SidebarMenuSubButton asChild isActive={currentPath === child.href}>
                                    <Link href={child.href}>
                                        <child.icon className="size-3.5" />
                                        <span>{child.title}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    );
}

// Breadcrumb based on current path
function AdminBreadcrumb({ currentPath }: { currentPath: string }) {
    const segments = currentPath.replace("/admin", "").split("/").filter(Boolean);

    const labels: Record<string, string> = {
        quotes: "Quotes",
        shop: "Shop",
        products: "Products",
        orders: "Orders",
        "gift-certificates": "Gift Certificates",
        cms: "Content",
        blog: "Blog Posts",
        testimonials: "Testimonials",
        services: "Services",
        gallery: "Gallery",
        "business-info": "Business Info",
        analytics: "Analytics",
        team: "Team",
    };

    if (segments.length === 0) {
        return <span className="text-sm font-medium">Dashboard</span>;
    }

    return (
        <nav className="flex items-center gap-1.5 text-sm">
            <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
            </Link>
            {segments.map((segment, i) => (
                <span key={segment} className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">/</span>
                    {i === segments.length - 1 ? (
                        <span className="font-medium">{labels[segment] || segment}</span>
                    ) : (
                        <span className="text-muted-foreground">{labels[segment] || segment}</span>
                    )}
                </span>
            ))}
        </nav>
    );
}
