import { z } from 'zod';

export const notificationsSettingsSchema = z.object({
  newBooking: z.boolean().default(true),
  newReview: z.boolean().default(true),
  payoutcompleted: z.boolean().default(true),
  payoutintiated: z.boolean().default(true),
  securityalert: z.boolean().default(true),
  policychange: z.boolean().default(true),
  promotionaloffer: z.boolean().default(true),
  tipsforhost: z.boolean().default(true),
  bookingreminder: z.boolean().default(true),
});

export type NotificationsSettings = z.infer<typeof notificationsSettingsSchema>;
