import { trpc } from "@/lib/trpc";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotFound from "./NotFound";

export default function BlogPost() {
    const [match, params] = useRoute("/blog/:slug");
    const slug = params?.slug;

    const { data: post, isLoading } = trpc.cms.blog.getBySlug.useQuery(
        { slug: slug || "" },
        { enabled: !!slug }
    );

    if (!slug) return <NotFound />;
    if (isLoading) return <div className="pt-32 pb-20 text-center">Loading...</div>;
    if (!post) return <NotFound />;

    return (
        <div className="pt-24 pb-20">
            {/* Featured Image Header */}
            <div className="relative h-[40vh] md:h-[50vh] min-h-[400px] w-full overflow-hidden">
                {post.featuredImageUrl ? (
                    <img
                        src={post.featuredImageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-zinc-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
                    <div className="container max-w-4xl mx-auto">
                        <Link href="/blog">
                            <Button variant="link" className="text-white/80 hover:text-primary p-0 h-auto mb-6 gap-2">
                                <ArrowLeft className="w-4 h-4" /> Back to News
                            </Button>
                        </Link>

                        <div className="flex flex-wrap gap-4 mb-4 text-sm font-bold uppercase tracking-wider">
                            {post.category && (
                                <span className="bg-primary/90 text-white px-3 py-1 rounded-sm">
                                    {post.category}
                                </span>
                            )}
                        </div>

                        <h1 className="font-heading font-bold text-4xl md:text-6xl uppercase text-white mb-6 drop-shadow-lg leading-none">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                {new Date(post.publishedAt || post.createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                            {/* Add author if available in schema, for now hardcode or omit */}
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-primary" />
                                Caspers Team
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container max-w-4xl mx-auto mt-12">
                <div
                    className="prose prose-invert prose-lg max-w-none 
          prose-headings:font-heading prose-headings:uppercase prose-headings:font-bold
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-img:rounded-sm prose-img:border prose-img:border-border"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {post.tags && (
                    <div className="mt-16 pt-8 border-t border-border flex items-center gap-3">
                        <Tag className="w-5 h-5 text-primary" />
                        <div className="flex flex-wrap gap-2">
                            {post.tags.split(',').map(tag => (
                                <span key={tag.trim()} className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-sm">
                                    #{tag.trim()}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
