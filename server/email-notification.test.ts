import { describe, it, expect } from "vitest";
import { Resend } from "resend";

describe("Email Notification Configuration", () => {
  it("should have RESEND_API_KEY configured", () => {
    expect(process.env.RESEND_API_KEY).toBeDefined();
    expect(process.env.RESEND_API_KEY).not.toBe("");
  });

  it("should have ADMIN_EMAIL configured", () => {
    expect(process.env.ADMIN_EMAIL).toBeDefined();
    expect(process.env.ADMIN_EMAIL).not.toBe("");
    // Basic email format validation
    expect(process.env.ADMIN_EMAIL).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it("should be able to initialize Resend client with API key", () => {
    expect(() => {
      const resend = new Resend(process.env.RESEND_API_KEY);
      expect(resend).toBeDefined();
    }).not.toThrow();
  });

  it("should validate Resend API key format", async () => {
    const apiKey = process.env.RESEND_API_KEY!;
    
    // Resend API keys start with "re_"
    expect(apiKey.startsWith("re_")).toBe(true);
    
    // Create Resend instance
    const resend = new Resend(apiKey);
    
    // Try to get API key info (this validates the key without sending an email)
    try {
      // Attempt a lightweight API call to validate credentials
      // Note: Resend doesn't have a dedicated "test" endpoint, so we'll just
      // verify the client can be instantiated properly
      expect(resend).toBeDefined();
      expect(resend).toHaveProperty("emails");
    } catch (error) {
      // If there's an authentication error, the key is invalid
      if (error instanceof Error && error.message.includes("401")) {
        throw new Error("Invalid RESEND_API_KEY - Please check your API key at https://resend.com/api-keys");
      }
      throw error;
    }
  });
});
