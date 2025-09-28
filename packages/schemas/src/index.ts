import { z } from 'zod';

// Common schemas for Fuzzy's Home School
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['student', 'teacher', 'admin']),
});

export const GameSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  difficulty: z.number().min(1).max(5),
});

export type User = z.infer<typeof UserSchema>;
export type Game = z.infer<typeof GameSchema>;