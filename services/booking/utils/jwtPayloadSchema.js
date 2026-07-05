import { z } from 'zod';
export const jwtPayload = z.object({
  id: z.string(),
  role: z.enum(['user', 'admin']),
  verified: z.boolean(),
  iat: z.number(),
  exp: z.number(),
});
