import { z } from 'zod';

enum Role {
  USER = 'USER',
  SELLER = 'SELLER',
}

export const CreateUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6).optional(), // optional for Google/GitHub
  avatar: z.string().url().optional(),
  providerId: z.string().optional(),
  role: z
    .string()
    .default('USER')
    .optional()
    .transform((val) => val?.toUpperCase()),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
