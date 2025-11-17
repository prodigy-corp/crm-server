import { z } from 'zod';

export const analyticsQuerySchema = z.object({
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format'),
});

export type AnalyticsQueryDto = z.infer<typeof analyticsQuerySchema>;

export const trafficSourcesQuerySchema = z.object({
  days: z
    .string()
    .regex(/^\d+$/, 'Days must be a number')
    .transform((val) => parseInt(val))
    .default(30)
    .optional(),
});

export type TrafficSourcesQueryDto = z.infer<typeof trafficSourcesQuerySchema>;
