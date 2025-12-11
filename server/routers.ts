import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { adminAuthRouter } from "./adminAuth";
import { teamRouter } from "./teamRouter";
import { cmsRouter } from "./cmsRouter";
import { z } from "zod";
import { createQuoteSubmission, addQuoteFile, getAllQuoteSubmissions, getQuoteSubmissionById, getQuoteFiles, updateQuoteStatus } from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { notifyOwner } from "./_core/notification";
import { sendQuoteConfirmationEmail, sendAdminNotificationEmail } from "./email";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  adminAuth: adminAuthRouter,
  team: teamRouter,
  cms: cmsRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  quotes: router({
    /**
     * Submit a new quote request
     */
    submit: publicProcedure
      .input(z.object({
        // Customer Information
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Valid email is required"),
        phone: z.string().optional(),
        
        // Vehicle Information
        vehicleType: z.string().min(1, "Vehicle type is required"),
        vehicleMake: z.string().optional(),
        vehicleModel: z.string().optional(),
        vehicleYear: z.string().optional(),
        
        // Service Information
        serviceType: z.string().min(1, "Service type is required"),
        paintFinish: z.string().optional(),
        
        // Additional Details
        description: z.string().optional(),
        budget: z.string().optional(),
        timeline: z.string().optional(),
        
        // Files (base64 encoded images)
        files: z.array(z.object({
          fileName: z.string(),
          fileType: z.string(),
          fileData: z.string(), // base64 encoded
        })).optional(),
      }))
      .mutation(async ({ input }) => {
        // Create the quote submission
        const quoteId = await createQuoteSubmission({
          name: input.name,
          email: input.email,
          phone: input.phone || null,
          vehicleType: input.vehicleType,
          vehicleMake: input.vehicleMake || null,
          vehicleModel: input.vehicleModel || null,
          vehicleYear: input.vehicleYear || null,
          serviceType: input.serviceType,
          paintFinish: input.paintFinish || null,
          description: input.description || null,
          budget: input.budget || null,
          timeline: input.timeline || null,
        });

        // Upload files to S3 if provided
        if (input.files && input.files.length > 0) {
          for (const file of input.files) {
            try {
              // Decode base64 to buffer
              const base64Data = file.fileData.replace(/^data:image\/\w+;base64,/, '');
              const buffer = Buffer.from(base64Data, 'base64');
              
              // Generate unique file key
              const fileExtension = file.fileName.split('.').pop() || 'jpg';
              const fileKey = `quotes/${quoteId}/${nanoid()}.${fileExtension}`;
              
              // Upload to S3
              const { url } = await storagePut(fileKey, buffer, file.fileType);
              
              // Save file metadata to database
              await addQuoteFile({
                quoteId: Number(quoteId),
                fileKey,
                fileUrl: url,
                fileName: file.fileName,
                fileType: file.fileType,
                fileSize: buffer.length,
              });
            } catch (error) {
              console.error('Error uploading file:', error);
              // Continue with other files even if one fails
            }
          }
        }

        // Notify owner
        await notifyOwner({
          title: "New Quote Request",
          content: `${input.name} has submitted a quote request for ${input.vehicleType} ${input.serviceType}`,
        });

        // Send confirmation email to customer
        await sendQuoteConfirmationEmail({
          customerName: input.name,
          customerEmail: input.email,
          quoteId,
          vehicleType: input.vehicleType,
          vehicleMake: input.vehicleMake,
          vehicleModel: input.vehicleModel,
          vehicleYear: input.vehicleYear,
          serviceType: input.serviceType,
          description: input.description,
        });

        // Send notification email to admin
        await sendAdminNotificationEmail({
          quoteId,
          customerName: input.name,
          customerEmail: input.email,
          customerPhone: input.phone,
          vehicleType: input.vehicleType,
          vehicleMake: input.vehicleMake,
          vehicleModel: input.vehicleModel,
          vehicleYear: input.vehicleYear,
          serviceType: input.serviceType,
          description: input.description,
          fileCount: input.files?.length || 0,
        });

        return { success: true, quoteId };
      }),

    /**
     * Get all quote submissions (admin only)
     */
    list: publicProcedure.query(async ({ ctx }) => {
      // Check admin session cookie
      const isAdminAuthenticated = ctx.req.cookies?.['admin_session'] === 'authenticated';
      
      if (!isAdminAuthenticated) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Admin authentication required' });
      }
      
      return await getAllQuoteSubmissions();
    }),

    /**
     * Update quote status (admin only)
     */
    updateStatus: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["new", "reviewed", "quoted", "accepted", "declined", "completed"]),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check admin session cookie
        const isAdminAuthenticated = ctx.req.cookies?.['admin_session'] === 'authenticated';
        
        if (!isAdminAuthenticated) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Admin authentication required' });
        }
        
        const quote = await getQuoteSubmissionById(input.id);
        if (!quote) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Quote not found' });
        }

        await updateQuoteStatus(input.id, input.status);
        return { success: true };
      }),

    /**
     * Get a single quote with its files
     */
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const quote = await getQuoteSubmissionById(input.id);
        if (!quote) {
          throw new Error("Quote not found");
        }
        
        const files = await getQuoteFiles(input.id);
        
        return { quote, files };
      }),
  }),
});

export type AppRouter = typeof appRouter;
