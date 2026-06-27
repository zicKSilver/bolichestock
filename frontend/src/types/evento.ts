import { z } from 'zod'

export const EventoSchema = z.object({
  id: z.number(),
  fecha: z.string(),
  estado: z.string(),
  totalTickets: z.number(),
  totalVendido: z.number(),
})

export const CierreCajaSchema = z.object({
  id: z.number(),
  eventoId: z.number(),
  totalVendido: z.number(),
  efectivoEnCaja: z.number(),
  descuentoManual: z.number(),
  diferencia: z.number(),
  fechaHoraCierre: z.string(),
})

export const ProductoEventoTicketSchema = z.object({
  id: z.number(),
  eventoId: z.number(),
  productoId: z.number(),
  productoNombre: z.string(),
  productoPrecio: z.number(),
  numeroInicial: z.number(),
  numeroFinal: z.number().nullable(),
  totalTicketera: z.number(),
  completada: z.boolean(),
  ticketsCalculados: z.number(),
  subtotal: z.number(),
})

export const StockItemSchema = z.object({
  productoId: z.number(),
  productoNombre: z.string(),
  stock: z.number(),
  consumo: z.number(),
  sinStockNecesario: z.boolean().optional(),
})

export const CierreListadoSchema = z.object({
  id: z.number(),
  eventoId: z.number(),
  fechaEvento: z.string(),
  totalVendido: z.number(),
  efectivoEnCaja: z.number(),
  descuentoManual: z.number(),
  diferencia: z.number(),
  fechaHoraCierre: z.string(),
})

export type Evento = z.infer<typeof EventoSchema>
export type CierreCaja = z.infer<typeof CierreCajaSchema>
export type ProductoEventoTicket = z.infer<typeof ProductoEventoTicketSchema>
export type StockItem = z.infer<typeof StockItemSchema>
export type CierreListado = z.infer<typeof CierreListadoSchema>
