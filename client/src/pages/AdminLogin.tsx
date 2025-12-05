import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");

  const loginMutation = trpc.adminAuth.login.useMutation({
    onSuccess: () => {
      toast.success("Login successful!");
      setLocation("/admin");
    },
    onError: (error) => {
      toast.error(error.message || "Invalid password");
      setPassword("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error("Please enter a password");
      return;
    }
    loginMutation.mutate({ password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-card border border-border rounded-lg p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-primary skew-x-[-10deg] flex items-center justify-center border border-primary-foreground/20">
                <span className="font-heading font-bold text-3xl text-primary-foreground skew-x-[10deg]">
                  CP
                </span>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="font-heading font-bold text-3xl uppercase mb-2">
              Admin <span className="text-primary">Login</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your password to access the dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={loginMutation.isPending}
                  autoFocus
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full font-heading uppercase tracking-wider"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Login
                </>
              )}
            </Button>
          </form>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Back to Home
            </a>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>This is a secure admin area. Unauthorized access is prohibited.</p>
        </div>
      </div>
    </div>
  );
}
