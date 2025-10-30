import { z } from "zod";

export const bookingSchema = z.object({
  experienceId: z.string().min(1),
  slotId: z.string().min(1),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  persons: z.number().int().positive().max(20),
  promoCode: z.string().optional(),
});
export type BookingInput = z.infer<typeof bookingSchema>;

export const promoSchema = z.object({
  code: z.string().min(1),
  experienceId: z.string().min(1),
  persons: z.number().int().positive(),
  subtotal: z.number().nonnegative(),
});
export type PromoInput = z.infer<typeof promoSchema>;
