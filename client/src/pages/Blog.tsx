import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowRight, Calendar, User } from "lucide-react";

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all published blog posts
  const { data: posts = [], isLoading } = trpc.cms.blog.getAll.useQuery();

  // Get unique categories
  const categories = Array.from(new Set(posts.map((post: any) => post.category)));

  // Filter posts
  const filteredPosts = posts.filter((post: any) => {
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Featured post (first one)
  const featuredPost = posts.find((p: any) => p.isFeatured === 1) || posts[0];

  // Format date
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div className="pt-24 pb-20">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-heading font-bold text-5xl md:text-6xl uppercase mb-6">
            Our <span className="text-primary">Blog</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Latest news, tips, and insights from the automotive refinishing world.
          </p>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-20">
            <Link href={`/blog/${featuredPost.slug}`} className="group block">
                <Card className="overflow-hidden border-2 border-primary/30 hover:border-primary transition-colors">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-12">
                    <div className="flex flex-col justify-center">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-primary font-semibold text-sm uppercase tracking-wider">
                          Featured
                        </span>
                        <span className="text-muted-foreground text-sm capitalize">
                          {featuredPost.category}
                        </span>
                      </div>
                      <h2 className="font-heading font-bold text-4xl uppercase mb-4 group-hover:text-primary transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(featuredPost.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="w-full aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg border border-primary/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <ArrowRight className="w-12 h-12 text-primary/50 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>
                </Card>
            </Link>
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-12 space-y-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  selectedCategory === null
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-foreground hover:border-primary"
                }`}
              >
                All Articles
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-md font-medium transition-colors capitalize ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-foreground hover:border-primary"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Blog Posts Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              {searchQuery ? "No articles found matching your search." : "No articles available yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post: any) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group h-full block">
                  <Card className="p-6 h-full flex flex-col border-border hover:border-primary transition-colors">
                    {/* Category & Date */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-primary font-semibold text-xs uppercase tracking-wider">
                        {post.category}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {formatDate(post.createdAt as string)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-heading font-bold text-xl uppercase mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-muted-foreground text-sm mb-6 flex-grow line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Read More Button */}
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all">
                      Read More
                      <ArrowRight className="w-4 h-4" />
                    </div>                  </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
