import { z } from 'zod';

export const createGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required'),
  memberIds: z.array(z.string()).min(1, 'At least one member is required'),
});

export type CreateGroupDto = z.infer<typeof createGroupSchema>;

export const addMembersSchema = z.object({
  memberIds: z.array(z.string()).min(1, 'At least one member is required'),
});

export type AddMembersDto = z.infer<typeof addMembersSchema>;

export const updateGroupSchema = z.object({
  name: z.string().optional(),
  avatar: z.string().optional(),
});

export type UpdateGroupDto = z.infer<typeof updateGroupSchema>;
