import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";

export default function Shop() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center px-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-block mb-8"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <ShoppingBag className="w-24 h-24 text-primary relative z-10" strokeWidth={1.5} />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="font-heading font-bold text-5xl md:text-7xl uppercase mb-6"
        >
          Shop
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <p className="text-2xl md:text-3xl font-heading uppercase tracking-wider text-primary">
            Coming Soon
          </p>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            We're working on bringing you exclusive Caspers Paintworks merchandise and gift certificates.
            Stay tuned!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12"
        >
          <div className="flex items-center justify-center gap-2">
            <div className="h-2 w-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
            <div className="h-2 w-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
            <div className="h-2 w-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
