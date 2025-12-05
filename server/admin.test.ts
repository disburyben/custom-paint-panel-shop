import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

// Mock the dependencies
vi.mock("./db");

function createMockContext(role: "admin" | "user" | null = null): TrpcContext {
  return {
    user: role
      ? {
          id: 1,
          openId: "test-open-id",
          name: "Test User",
          email: "test@example.com",
          loginMethod: "oauth",
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        }
      : null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("quotes.list (admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return all quotes for admin users", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    const mockQuotes = [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
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
        status: "new" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "0412345678",
        vehicleType: "motorcycle",
        vehicleMake: "Harley",
        vehicleModel: "Sportster",
        vehicleYear: "2020",
        serviceType: "restoration",
        paintFinish: "gloss",
        description: "Full restoration needed",
        budget: "$10000-$15000",
        timeline: "3-4 months",
        status: "reviewed" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(db.getAllQuoteSubmissions).mockResolvedValue(mockQuotes);

    const result = await caller.quotes.list();

    expect(result).toEqual(mockQuotes);
    expect(db.getAllQuoteSubmissions).toHaveBeenCalled();
  });

  it("should reject non-admin users", async () => {
    const ctx = createMockContext("user");
    const caller = appRouter.createCaller(ctx);

    await expect(caller.quotes.list()).rejects.toThrow("Admin access required");
  });

  it("should reject unauthenticated users", async () => {
    const ctx = createMockContext(null);
    const caller = appRouter.createCaller(ctx);

    await expect(caller.quotes.list()).rejects.toThrow();
  });
});

describe("quotes.updateStatus (admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update quote status for admin users", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    const mockQuote = {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
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
      status: "new" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(db.getQuoteSubmissionById).mockResolvedValue(mockQuote);
    vi.mocked(db.updateQuoteStatus).mockResolvedValue(undefined);

    const result = await caller.quotes.updateStatus({
      id: 1,
      status: "reviewed",
    });

    expect(result).toEqual({ success: true });
    expect(db.getQuoteSubmissionById).toHaveBeenCalledWith(1);
    expect(db.updateQuoteStatus).toHaveBeenCalledWith(1, "reviewed");
  });

  it("should reject non-admin users", async () => {
    const ctx = createMockContext("user");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.quotes.updateStatus({
        id: 1,
        status: "reviewed",
      })
    ).rejects.toThrow("Admin access required");
  });

  it("should throw error when quote not found", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    vi.mocked(db.getQuoteSubmissionById).mockResolvedValue(undefined);

    await expect(
      caller.quotes.updateStatus({
        id: 999,
        status: "reviewed",
      })
    ).rejects.toThrow("Quote not found");
  });

  it("should validate status enum values", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.quotes.updateStatus({
        id: 1,
        status: "invalid-status" as any,
      })
    ).rejects.toThrow();
  });
});

describe("quotes.getById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return quote with files for any authenticated user", async () => {
    const ctx = createMockContext("user");
    const caller = appRouter.createCaller(ctx);

    const mockQuote = {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
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
      status: "new" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockFiles = [
      {
        id: 1,
        quoteId: 1,
        fileKey: "quotes/1/file.jpg",
        fileUrl: "https://storage.example.com/quotes/1/file.jpg",
        fileName: "photo.jpg",
        fileType: "image/jpeg",
        fileSize: 12345,
        uploadedAt: new Date(),
      },
    ];

    vi.mocked(db.getQuoteSubmissionById).mockResolvedValue(mockQuote);
    vi.mocked(db.getQuoteFiles).mockResolvedValue(mockFiles);

    const result = await caller.quotes.getById({ id: 1 });

    expect(result).toEqual({ quote: mockQuote, files: mockFiles });
  });
});
