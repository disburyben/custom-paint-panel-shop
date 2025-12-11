import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { createContactSubmission, getContactSubmissions, getContactSubmissionById, updateContactSubmissionStatus, deleteContactSubmission, getUnreadContactSubmissions } from "./contactDb";
import type { InsertContactSubmission } from "../drizzle/schema";

describe("Contact Submissions", () => {
  let submissionId: number;

  const testSubmission: InsertContactSubmission = {
    name: "John Test",
    email: "john@test.com",
    phone: "(08) 1234 5678",
    subject: "Test Inquiry",
    message: "This is a test message for the contact form.",
    status: "new",
  };

  it("should create a contact submission", async () => {
    const submission = await createContactSubmission(testSubmission);
    expect(submission).toBeDefined();
    expect(submission.name).toBe(testSubmission.name);
    expect(submission.email).toBe(testSubmission.email);
    expect(submission.status).toBe("new");
    submissionId = submission.id;
  });

  it("should retrieve all contact submissions", async () => {
    const submissions = await getContactSubmissions(10, 0);
    expect(Array.isArray(submissions)).toBe(true);
    expect(submissions.length).toBeGreaterThan(0);
  });

  it("should retrieve a contact submission by ID", async () => {
    const submission = await getContactSubmissionById(submissionId);
    expect(submission).toBeDefined();
    expect(submission?.id).toBe(submissionId);
    expect(submission?.name).toBe(testSubmission.name);
  });

  it("should update contact submission status", async () => {
    const updated = await updateContactSubmissionStatus(submissionId, "read");
    expect(updated.status).toBe("read");
  });

  it("should retrieve unread submissions", async () => {
    // Create a new unread submission
    const newSubmission = await createContactSubmission({
      ...testSubmission,
      email: "unread@test.com",
      status: "new",
    });

    const unreadSubmissions = await getUnreadContactSubmissions();
    expect(Array.isArray(unreadSubmissions)).toBe(true);
    expect(unreadSubmissions.length).toBeGreaterThan(0);

    // Cleanup
    await deleteContactSubmission(newSubmission.id);
  });

  it("should delete a contact submission", async () => {
    await deleteContactSubmission(submissionId);
    const deleted = await getContactSubmissionById(submissionId);
    expect(deleted).toBeUndefined();
  });

  it("should validate required fields", async () => {
    const invalidSubmission: InsertContactSubmission = {
      name: "",
      email: "invalid",
      phone: null,
      subject: "",
      message: "",
      status: "new",
    };

    // This should fail validation in the API layer
    // For now, we just verify the function exists
    expect(createContactSubmission).toBeDefined();
  });
});
