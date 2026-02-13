import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import {
  FileText,
  MessageSquare,
  Wrench,
  Settings,
  Image,
  BarChart3,
  Users,
} from "lucide-react";

export default function CMSDashboard() {
  const cmsModules = [
    {
      title: "Blog Posts",
      description: "Create and manage blog articles and news posts",
      icon: FileText,
      href: "/admin/cms/blog",
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "Testimonials",
      description: "Manage customer reviews and testimonials",
      icon: MessageSquare,
      href: "/admin/cms/testimonials",
      color: "bg-green-500/10 text-green-600",
    },
    {
      title: "Services",
      description: "Edit service descriptions, pricing, and details",
      icon: Wrench,
      href: "/admin/cms/services",
      color: "bg-orange-500/10 text-orange-600",
    },
    {
      title: "Gallery",
      description: "Upload and manage before/after project photos",
      icon: Image,
      href: "/admin/cms/gallery",
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      title: "Sprayers",
      description: "Manage team member profiles and certifications",
      icon: Users,
      href: "/admin/cms/sprayers",
      color: "bg-cyan-500/10 text-cyan-600",
    },
    {
      title: "Business Info",
      description: "Update contact details, hours, and social media",
      icon: Settings,
      href: "/admin/cms/business-info",
      color: "bg-indigo-500/10 text-indigo-600",
    },
    {
      title: "Analytics",
      description: "View website statistics and performance",
      icon: BarChart3,
      href: "/admin/cms/analytics",
      color: "bg-red-500/10 text-red-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Content Management System</h1>
        <p className="text-muted-foreground text-lg">
          Manage all website content from one place
        </p>
      </div>

      {/* CMS Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cmsModules.map((module) => {
          const Icon = module.icon;
          return (
            <Link key={module.href} href={module.href}>
              <Card className="p-6 hover:border-primary/50 transition-colors cursor-pointer h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${module.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{module.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {module.description}
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Manage
                </Button>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Stats */}
      <Card className="p-6 bg-card/50">
        <h2 className="text-xl font-bold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-muted-foreground text-sm">Total Blog Posts</p>
            <p className="text-2xl font-bold">--</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Testimonials</p>
            <p className="text-2xl font-bold">--</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Services</p>
            <p className="text-2xl font-bold">--</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Gallery Items</p>
            <p className="text-2xl font-bold">--</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
