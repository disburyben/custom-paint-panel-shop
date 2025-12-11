import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Calendar, Tag } from "lucide-react";

export default function BlogDetail() {
  const [match, params] = useRoute("/blog/:slug");

  // Fetch all posts to find the one with matching slug
  const { data: posts = [], isLoading } = trpc.cms.blog.getAll.useQuery();
  const post = posts.find((p: any) => p.slug === params?.slug);

  // Format date
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pt-24 pb-20">
        <div className="container">
          <div className="text-center py-20">
            <h1 className="font-heading font-bold text-3xl uppercase mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist.</p>
            <Link href="/blog">
              <Button className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20">
      <div className="container max-w-4xl">
        {/* Back Button */}
        <Link href="/blog">
          <a className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </a>
        </Link>

        {/* Article Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider">
              <Tag className="w-4 h-4" />
              {post.category}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Calendar className="w-4 h-4" />
              {formatDate(post.createdAt)}
            </div>
          </div>

          <h1 className="font-heading font-bold text-5xl md:text-6xl uppercase mb-6">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-muted-foreground text-xl leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Article Content */}
        <div className="prose prose-invert max-w-none">
          <div
            className="text-muted-foreground leading-relaxed space-y-6"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Related Articles */}
        <div className="mt-20 pt-12 border-t border-border">
          <h2 className="font-heading font-bold text-3xl uppercase mb-8">
            More <span className="text-primary">Articles</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts
              .filter((p: any) => p.slug !== post.slug && p.isFeatured !== 1)
              .slice(0, 3)
              .map((relatedPost: any) => (
                <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="group block">
                    <div className="bg-card border border-border p-6 rounded-lg hover:border-primary transition-colors h-full flex flex-col">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-primary font-semibold text-xs uppercase tracking-wider">
                          {relatedPost.category}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {formatDate(relatedPost.createdAt)}
                        </span>
                      </div>
                      <h3 className="font-heading font-bold text-lg uppercase mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-muted-foreground text-sm flex-grow line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
