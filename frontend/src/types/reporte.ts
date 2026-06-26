import { z } from 'zod'

export const ReporteItemSchema = z.object({
  producto: z.string(),
  cantidadTotal: z.number(),
  precioPromedioPonderado: z.number(),
  totalVendido: z.number(),
})

export const ReporteGeneralSchema = z.object({
  items: z.array(ReporteItemSchema),
  descuentoManual: z.number(),
  totalBruto: z.number(),
  totalNeto: z.number(),
})

export type ReporteItem = z.infer<typeof ReporteItemSchema>
export type ReporteGeneral = z.infer<typeof ReporteGeneralSchema>
