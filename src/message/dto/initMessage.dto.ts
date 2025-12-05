import { z } from 'zod';

export const initMessageSchema = z.object({
  receiverId: z.string().min(1, 'Receiver ID is required'),
  message: z.string().min(1, 'Message is required'),
});

export type InitMessageDto = z.infer<typeof initMessageSchema>;
