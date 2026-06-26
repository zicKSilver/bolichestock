import { z } from 'zod'

export const ProductoSchema = z.object({
  id: z.number(),
  nombre: z.string(),
  precio: z.number(),
})

export const ProductoRequestSchema = z.object({
  nombre: z.string(),
  precio: z.number(),
})

export type Producto = z.infer<typeof ProductoSchema>
export type ProductoRequest = z.infer<typeof ProductoRequestSchema>
