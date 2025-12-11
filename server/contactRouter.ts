import { router, adminProcedure, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  createContactSubmission,
  getContactSubmissions,
  getContactSubmissionById,
  updateContactSubmissionStatus,
  deleteContactSubmission,
  getUnreadContactSubmissions,
} from "./contactDb";
import { sendContactConfirmationEmail, sendContactNotificationEmail } from "./email";

export const contactRouter = router({
  // Public procedure: Submit contact form
  submit: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        phone: z.string().optional(),
        subject: z.string().min(5, "Subject must be at least 5 characters"),
        message: z.string().min(10, "Message must be at least 10 characters"),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        // Create submission in database
        const submission = await createContactSubmission({
          name: input.name,
          email: input.email,
          phone: input.phone || null,
          subject: input.subject,
          message: input.message,
          status: "new",
        });

        // Send confirmation email to user
        await sendContactConfirmationEmail({
          name: input.name,
          email: input.email,
          subject: input.subject,
        });

        // Send notification email to admin
        await sendContactNotificationEmail({
          name: input.name,
          email: input.email,
          phone: input.phone,
          subject: input.subject,
          message: input.message,
        });

        return {
          success: true,
          submissionId: submission.id,
          message: "Thank you for contacting us! We'll get back to you soon.",
        };
      } catch (error) {
        console.error("Error submitting contact form:", error);
        throw new Error("Failed to submit contact form. Please try again.");
      }
    }),

  // Protected procedure: Get all submissions (admin only)
  getAll: adminProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }: any) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }
      return getContactSubmissions(input.limit, input.offset);
    }),

  // Protected procedure: Get submission by ID
  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }: any) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }
      return getContactSubmissionById(input.id);
    }),

  // Protected procedure: Get unread submissions
  getUnread: adminProcedure.query(async ({ ctx }: any) => {
    if (ctx.user?.role !== "admin") {
      throw new Error("Unauthorized");
    }
    return getUnreadContactSubmissions();
  }),

  // Protected procedure: Update submission status
  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["new", "read", "replied"]),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }
      return updateContactSubmissionStatus(input.id, input.status);
    }),

  // Protected procedure: Delete submission
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }: any) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }
      await deleteContactSubmission(input.id);
      return { success: true };
    }),
});
