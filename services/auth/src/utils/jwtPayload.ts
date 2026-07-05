import { z } from 'zod';
export const jwtPayload = z.object({
  sub: z.string(),
  role: z.enum(['user', 'admin']),
  verified: z.boolean().optional(),
  iat: z.number().optional(),
  exp: z.number(),
});

export type JwtPayload = z.infer<typeof jwtPayload>;
