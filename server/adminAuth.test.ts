import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

// Mock dependencies
vi.mock("./db");
vi.mock("./_core/env", () => ({
  ENV: {
    adminPassword: "test-admin-password-123",
  },
}));

function createMockContext(cookies: Record<string, string> = {}): TrpcContext {
  const mockRes = {
    cookie: vi.fn(),
    clearCookie: vi.fn(),
  };

  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
      cookies,
    } as any,
    res: mockRes as any,
  };
}

describe("adminAuth.login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should login successfully with correct password", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adminAuth.login({
      password: "test-admin-password-123",
    });

    expect(result).toEqual({ success: true });
    expect(ctx.res.cookie).toHaveBeenCalledWith(
      "admin_session",
      "authenticated",
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      })
    );
  });

  it("should reject login with incorrect password", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.adminAuth.login({
        password: "wrong-password",
      })
    ).rejects.toThrow("Invalid password");
  });

  it("should reject login with empty password", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.adminAuth.login({
        password: "",
      })
    ).rejects.toThrow();
  });
});

describe("adminAuth.check", () => {
  it("should return authenticated true when session cookie is present", async () => {
    const ctx = createMockContext({ admin_session: "authenticated" });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adminAuth.check();

    expect(result).toEqual({ authenticated: true });
  });

  it("should return authenticated false when session cookie is missing", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adminAuth.check();

    expect(result).toEqual({ authenticated: false });
  });

  it("should return authenticated false when session cookie has wrong value", async () => {
    const ctx = createMockContext({ admin_session: "invalid" });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adminAuth.check();

    expect(result).toEqual({ authenticated: false });
  });
});

describe("adminAuth.logout", () => {
  it("should clear session cookie on logout", async () => {
    const ctx = createMockContext({ admin_session: "authenticated" });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adminAuth.logout();

    expect(result).toEqual({ success: true });
    expect(ctx.res.clearCookie).toHaveBeenCalledWith("admin_session");
  });
});

describe("quotes.list with admin session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should allow access with valid admin session", async () => {
    const ctx = createMockContext({ admin_session: "authenticated" });
    const caller = appRouter.createCaller(ctx);

    vi.mocked(db.getAllQuoteSubmissions).mockResolvedValue([]);

    const result = await caller.quotes.list();

    expect(result).toEqual([]);
  });

  it("should reject access without admin session", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.quotes.list()).rejects.toThrow(
      "Admin authentication required"
    );
  });
});

describe("quotes.updateStatus with admin session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should allow status update with valid admin session", async () => {
    const ctx = createMockContext({ admin_session: "authenticated" });
    const caller = appRouter.createCaller(ctx);

    vi.mocked(db.getQuoteSubmissionById).mockResolvedValue({
      id: 1,
      name: "Test",
      email: "test@example.com",
      phone: null,
      vehicleType: "car",
      vehicleMake: null,
      vehicleModel: null,
      vehicleYear: null,
      serviceType: "custom-paint",
      paintFinish: null,
      description: null,
      budget: null,
      timeline: null,
      status: "new",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(db.updateQuoteStatus).mockResolvedValue(undefined);

    const result = await caller.quotes.updateStatus({
      id: 1,
      status: "reviewed",
    });

    expect(result).toEqual({ success: true });
  });

  it("should reject status update without admin session", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.quotes.updateStatus({
        id: 1,
        status: "reviewed",
      })
    ).rejects.toThrow("Admin authentication required");
  });
});
