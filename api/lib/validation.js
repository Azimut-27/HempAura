import { z } from "zod";

const normalizedEmail = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .max(254)
  .refine((value) => !/[\r\n]/.test(value), "Invalid email");

export const contactSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: normalizedEmail,
    subject: z.string().trim().min(2).max(160),
    orderNumber: z.string().trim().max(80).optional().default(""),
    message: z.string().trim().min(10).max(4000),
    consent: z.literal(true),
    website: z.string().max(0).optional().default(""),
  })
  .strict();

export const newsletterSubscribeSchema = z
  .object({
    email: normalizedEmail,
    consent: z.literal(true),
    consentTextVersion: z.string().trim().min(1).max(40),
    website: z.string().max(0).optional().default(""),
  })
  .strict();

export const newsletterUnsubscribeSchema = z
  .object({
    email: normalizedEmail,
  })
  .strict();

export const checkoutSchema = z
  .object({
    items: z
      .array(
        z
          .object({
            productId: z.string().min(1).max(80),
            variantId: z.string().min(1).max(80).optional(),
            quantity: z.number().int().min(1).max(20),
          })
          .strict()
      )
      .min(1)
      .max(20),
  })
  .strict();
