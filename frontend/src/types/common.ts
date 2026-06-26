import { z } from 'zod'

export function PagedResultSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    totalCount: z.number(),
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
  })
}

export type PagedResult<T> = {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}
