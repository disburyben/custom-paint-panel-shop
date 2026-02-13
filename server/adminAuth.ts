import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { ENV } from "./_core/env";
import { initTRPC } from "@trpc/server";
import type { TrpcContext } from "./_core/context";
import superjson from "superjson";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

const ADMIN_SESSION_COOKIE = "admin_session";

// Middleware to check admin session
const requireAdminSession = t.middleware(async opts => {
  const { ctx, next } = opts;
  
  const isAuthenticated = ctx.req.cookies?.[ADMIN_SESSION_COOKIE] === "authenticated";
  
  if (!isAuthenticated) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Admin authentication required",
    });
  }
  
  return next({ ctx });
});

export const adminSessionProcedure = t.procedure.use(requireAdminSession);

export const adminAuthRouter = router({
  /**
   * Login with admin password
   */
  login: publicProcedure
    .input(
      z.object({
        password: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      const adminPassword = ENV.adminPassword;

      if (!adminPassword) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Admin password not configured",
        });
      }

      if (input.password !== adminPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid password",
        });
      }

      // Set session cookie
      ctx.res.cookie(ADMIN_SESSION_COOKIE, "authenticated", {
        httpOnly: true,
        secure: ctx.req.protocol === "https",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return { success: true };
    }),

  /**
   * Check if admin is authenticated
   */
  check: publicProcedure.query(({ ctx }) => {
    const isAuthenticated = ctx.req.cookies?.[ADMIN_SESSION_COOKIE] === "authenticated";
    return { authenticated: isAuthenticated };
  }),

  /**
   * Logout admin
   */
  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie(ADMIN_SESSION_COOKIE);
    return { success: true };
  }),
});
