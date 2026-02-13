import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";

export default function Blog() {
    const { data: posts, isLoading } = trpc.cms.blog.getAll.useQuery();

    return (
        <div className="pt-24 pb-20">
            <div className="container">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="font-heading font-bold text-5xl md:text-6xl uppercase mb-6">
                        Latest <span className="text-primary">News</span>
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Updates from the workshop, project spotlights, and automotive culture.
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-card border border-border h-[400px] animate-pulse" />
                        ))}
                    </div>
                ) : posts && posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post, index) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link href={`/blog/${post.slug}`}>
                                    <div className="group cursor-pointer bg-card border border-border overflow-hidden hover:border-primary/50 transition-all duration-300 h-full flex flex-col">
                                        <div className="relative aspect-video overflow-hidden border-b border-border">
                                            {post.featuredImageUrl ? (
                                                <img
                                                    src={post.featuredImageUrl}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-secondary flex items-center justify-center">
                                                    <span className="text-muted-foreground">No Image</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
                                        </div>

                                        <div className="p-6 flex flex-col flex-grow">
                                            <div className="flex justify-between items-center mb-4 text-xs uppercase tracking-wider">
                                                <span className="text-primary font-bold">{post.category || "News"}</span>
                                                <span className="text-muted-foreground">
                                                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <h3 className="font-heading font-bold text-2xl uppercase mb-3 group-hover:text-primary transition-colors">
                                                {post.title}
                                            </h3>

                                            {post.excerpt && (
                                                <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-grow">
                                                    {post.excerpt}
                                                </p>
                                            )}

                                            <div className="mt-auto pt-4 border-t border-border/50">
                                                <span className="text-sm font-bold uppercase tracking-wider group-hover:text-primary transition-colors flex items-center gap-2">
                                                    Read Article
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 border border-dashed border-border text-muted-foreground">
                        No news yet. Check back soon!
                    </div>
                )}
            </div>
        </div>
    );
}
