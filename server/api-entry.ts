import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./_core/oauth";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";

const app = express();

// Configure body parser with larger size limit for file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Cookie parser for admin authentication
app.use(cookieParser());

// OAuth callback under /api/oauth/callback
registerOAuthRoutes(app);

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Debug endpoint (REMOVE AFTER TESTING)
app.get("/api/debug-env", (req, res) => {
  res.json({
    hasAdminPassword: !!process.env.ADMIN_PASSWORD,
    adminPasswordLength: (process.env.ADMIN_PASSWORD || "").length,
    hasJwtSecret: !!process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV,
    envKeys: Object.keys(process.env).filter(k =>
      ["ADMIN_PASSWORD", "JWT_SECRET", "VITE_APP_ID", "DATABASE_URL", "SMTP_HOST"].includes(k)
    ),
  });
});

export default app;
