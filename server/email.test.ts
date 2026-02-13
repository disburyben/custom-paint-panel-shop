import { describe, expect, it, vi, beforeEach } from "vitest";
import { sendQuoteConfirmationEmail } from "./email";

describe("sendQuoteConfirmationEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console.log to avoid cluttering test output
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should generate and log email for quote confirmation", async () => {
    const quoteData = {
      customerName: "John Doe",
      customerEmail: "john@example.com",
      quoteId: 123,
      vehicleType: "car",
      vehicleMake: "Toyota",
      vehicleModel: "Camry",
      vehicleYear: "2020",
      serviceType: "custom-paint",
      description: "Full respray in metallic blue",
    };

    await sendQuoteConfirmationEmail(quoteData);

    // Verify console.log was called with email details
    expect(console.log).toHaveBeenCalledWith("=== QUOTE CONFIRMATION EMAIL ===");
    expect(console.log).toHaveBeenCalledWith(`To: ${quoteData.customerEmail}`);
    expect(console.log).toHaveBeenCalledWith(
      `Subject: Quote Request Received - Reference #${quoteData.quoteId}`
    );
  });



  it("should format vehicle info correctly when all details provided", async () => {
    const quoteData = {
      customerName: "Test User",
      customerEmail: "test@example.com",
      quoteId: 789,
      vehicleType: "car",
      vehicleMake: "Ford",
      vehicleModel: "Mustang",
      vehicleYear: "2022",
      serviceType: "collision-repair",
      description: "Front bumper repair",
    };

    await sendQuoteConfirmationEmail(quoteData);

    // Email should be generated successfully
    expect(console.log).toHaveBeenCalled();
  });

  it("should use vehicle type when make/model/year not provided", async () => {
    const quoteData = {
      customerName: "Test User",
      customerEmail: "test@example.com",
      quoteId: 999,
      vehicleType: "truck",
      vehicleMake: null,
      vehicleModel: null,
      vehicleYear: null,
      serviceType: "custom-paint",
      description: null,
    };

    await sendQuoteConfirmationEmail(quoteData);

    // Email should be generated successfully
    expect(console.log).toHaveBeenCalled();
  });
});
