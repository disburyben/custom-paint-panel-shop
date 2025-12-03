import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";
import * as storage from "./storage";
import * as notification from "./_core/notification";

// Mock the dependencies
vi.mock("./db");
vi.mock("./storage");
vi.mock("./_core/notification");

function createMockContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("quotes.submit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully submit a quote without files", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Mock database response
    vi.mocked(db.createQuoteSubmission).mockResolvedValue(1);
    vi.mocked(notification.notifyOwner).mockResolvedValue(true);

    const input = {
      name: "John Doe",
      email: "john@example.com",
      phone: "0412345678",
      vehicleType: "car",
      vehicleMake: "Ford",
      vehicleModel: "Mustang",
      vehicleYear: "2020",
      serviceType: "custom-paint",
      paintFinish: "gloss",
      description: "Full respray in candy red",
      budget: "$5000-$10000",
      timeline: "2-3 months",
    };

    const result = await caller.quotes.submit(input);

    expect(result).toEqual({ success: true, quoteId: 1 });
    expect(db.createQuoteSubmission).toHaveBeenCalledWith({
      name: input.name,
      email: input.email,
      phone: input.phone,
      vehicleType: input.vehicleType,
      vehicleMake: input.vehicleMake,
      vehicleModel: input.vehicleModel,
      vehicleYear: input.vehicleYear,
      serviceType: input.serviceType,
      paintFinish: input.paintFinish,
      description: input.description,
      budget: input.budget,
      timeline: input.timeline,
    });
    expect(notification.notifyOwner).toHaveBeenCalledWith({
      title: "New Quote Request",
      content: expect.stringContaining("John Doe"),
    });
  });

  it("should successfully submit a quote with files", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Mock database and storage responses
    vi.mocked(db.createQuoteSubmission).mockResolvedValue(2);
    vi.mocked(storage.storagePut).mockResolvedValue({
      url: "https://storage.example.com/quotes/2/file.jpg",
      key: "quotes/2/file.jpg",
    });
    vi.mocked(db.addQuoteFile).mockResolvedValue(undefined);
    vi.mocked(notification.notifyOwner).mockResolvedValue(true);

    const input = {
      name: "Jane Smith",
      email: "jane@example.com",
      vehicleType: "motorcycle",
      serviceType: "restoration",
      files: [
        {
          fileName: "bike-photo.jpg",
          fileType: "image/jpeg",
          fileData: "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
        },
      ],
    };

    const result = await caller.quotes.submit(input);

    expect(result).toEqual({ success: true, quoteId: 2 });
    expect(db.createQuoteSubmission).toHaveBeenCalled();
    expect(storage.storagePut).toHaveBeenCalled();
    expect(db.addQuoteFile).toHaveBeenCalledWith({
      quoteId: 2,
      fileKey: expect.stringContaining("quotes/2/"),
      fileUrl: expect.stringContaining("https://storage.example.com"),
      fileName: "bike-photo.jpg",
      fileType: "image/jpeg",
      fileSize: expect.any(Number),
    });
  });

  it("should reject quote submission with invalid email", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const input = {
      name: "Test User",
      email: "invalid-email",
      vehicleType: "car",
      serviceType: "custom-paint",
    };

    await expect(caller.quotes.submit(input as any)).rejects.toThrow();
  });

  it("should reject quote submission without required fields", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const input = {
      email: "test@example.com",
      // Missing name, vehicleType, serviceType
    };

    await expect(caller.quotes.submit(input as any)).rejects.toThrow();
  });
});

describe("quotes.list", () => {
  it("should return all quote submissions", async () => {
    const ctx = createMockContext();
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
    ];

    vi.mocked(db.getAllQuoteSubmissions).mockResolvedValue(mockQuotes);

    const result = await caller.quotes.list();

    expect(result).toEqual(mockQuotes);
    expect(db.getAllQuoteSubmissions).toHaveBeenCalled();
  });
});

describe("quotes.getById", () => {
  it("should return quote with files", async () => {
    const ctx = createMockContext();
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
    expect(db.getQuoteSubmissionById).toHaveBeenCalledWith(1);
    expect(db.getQuoteFiles).toHaveBeenCalledWith(1);
  });

  it("should throw error when quote not found", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    vi.mocked(db.getQuoteSubmissionById).mockResolvedValue(undefined);

    await expect(caller.quotes.getById({ id: 999 })).rejects.toThrow("Quote not found");
  });
});
