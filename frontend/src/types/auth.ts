import { z } from 'zod'

export const LoginResponseSchema = z.object({
  token: z.string(),
  nombreUsuario: z.string(),
  isAdmin: z.boolean(),
})

export type LoginResponse = z.infer<typeof LoginResponseSchema>
