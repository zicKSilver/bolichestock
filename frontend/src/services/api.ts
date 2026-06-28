import { z } from 'zod'
import { LoginResponseSchema, type LoginResponse } from '../types/auth'
import { ProductoSchema, type Producto, type ProductoRequest } from '../types/producto'
import { EventoSchema, CierreCajaSchema, ProductoEventoTicketSchema, StockItemSchema, CierreListadoSchema, type Evento, type CierreCaja, type ProductoEventoTicket, type StockItem, type CierreListado } from '../types/evento'
import { ReporteGeneralSchema, type ReporteGeneral } from '../types/reporte'
import { PagedResultSchema } from '../types/common'
import type { PagedResult } from '../types/common'
import { safeGet, safeRemove } from '../utils/storage'

const API_URL = import.meta.env.VITE_API_URL

async function request<T>(endpoint: string, schema: z.ZodType<T>, options?: RequestInit): Promise<T> {
  const token = safeGet('token')

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  if (res.status === 401 || res.status === 403) {
    safeRemove('token')
    safeRemove('user')
    window.location.href = '/login'
    throw new Error('No autorizado')
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error del servidor' }))
    throw new Error(error.message || `Error ${res.status}`)
  }

  if (res.status === 204) return undefined as unknown as T

  const json = await res.json()
  const result = schema.safeParse(json)
  if (!result.success) {
    console.error('API response validation failed:', result.error.issues)
    throw new Error('Respuesta inválida del servidor')
  }
  return result.data
}

const ProductosSchema = z.array(ProductoSchema)
const EventosSchema = z.array(EventoSchema)
const StockItemsSchema = z.array(StockItemSchema)
const ProductoEventoTicketsSchema = z.array(ProductoEventoTicketSchema)
const UsuariosSchema = z.array(z.object({
  id: z.number(),
  nombreUsuario: z.string(),
  isAdmin: z.boolean(),
}))

export const api = {
  login: (nombreUsuario: string, password: string) =>
    request<LoginResponse>('/api/auth/login', LoginResponseSchema, {
      method: 'POST',
      body: JSON.stringify({ nombreUsuario, password }),
    }),

  getProductos: () => request<Producto[]>('/api/productos', ProductosSchema),
  createProducto: (data: ProductoRequest) =>
    request<Producto>('/api/productos', ProductoSchema, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProducto: (id: number, data: ProductoRequest) =>
    request<Producto>(`/api/productos/${id}`, ProductoSchema, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteProducto: (id: number) =>
    request<void>(`/api/productos/${id}`, z.void(), {
      method: 'DELETE',
    }),

  getEventos: () => request<Evento[]>('/api/eventos', EventosSchema),
  getEvento: (id: number) => request<Evento>(`/api/eventos/${id}`, EventoSchema),
  abrirEvento: (fecha: string) =>
    request<Evento>('/api/eventos', EventoSchema, {
      method: 'POST',
      body: JSON.stringify({ fecha }),
    }),
  cerrarEvento: (id: number, efectivoEnCaja: number, descuentoManual: number) =>
    request<Evento>(`/api/eventos/${id}/cerrar`, EventoSchema, {
      method: 'PUT',
      body: JSON.stringify({ efectivoEnCaja, descuentoManual }),
    }),
  getCierre: (id: number) => request<CierreCaja>(`/api/eventos/${id}/cierre`, CierreCajaSchema),

  getStocks: (eventoId: number) => request<StockItem[]>(`/api/eventos/${eventoId}/stocks`, StockItemsSchema),
  updateStocks: (eventoId: number, items: StockItem[]) =>
    request<void>(`/api/eventos/${eventoId}/stocks`, z.void(), {
      method: 'PUT',
      body: JSON.stringify({ items }),
    }),

  getTicketRollos: (eventoId: number) =>
    request<ProductoEventoTicket[]>(`/api/eventos/${eventoId}/ticket-rollos`, ProductoEventoTicketsSchema),
  getTicketRollosPaged: (eventoId: number, page: number, pageSize = 20) =>
    request<PagedResult<ProductoEventoTicket>>(`/api/eventos/${eventoId}/ticket-rollos?page=${page}&pageSize=${pageSize}`,
      PagedResultSchema(ProductoEventoTicketSchema)),
  createTicketRollo: (eventoId: number, data: { productoId: number; numeroInicial: number; totalTicketera?: number }) =>
    request<ProductoEventoTicket>(`/api/eventos/${eventoId}/ticket-rollos`, ProductoEventoTicketSchema, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTicketRollo: (eventoId: number, id: number, data: { numeroInicial?: number; numeroFinal?: number | null; completada?: boolean; limpiarNumeroFinal?: boolean }) =>
    request<ProductoEventoTicket>(`/api/eventos/${eventoId}/ticket-rollos/${id}`, ProductoEventoTicketSchema, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteTicketRollo: (eventoId: number, id: number) =>
    request<void>(`/api/eventos/${eventoId}/ticket-rollos/${id}`, z.void(), {
      method: 'DELETE',
    }),

  getReporte: (desde: string, hasta: string, productoId?: number) =>
    request<ReporteGeneral>(`/api/reportes?desde=${desde}&hasta=${hasta}${productoId ? `&productoId=${productoId}` : ''}`, ReporteGeneralSchema),

  desactivarEvento: (id: number) =>
    request<Evento>(`/api/eventos/${id}/desactivar`, EventoSchema, { method: 'PUT' }),
  deleteCierre: (eventoId: number) =>
    request<void>(`/api/eventos/${eventoId}/cierre`, z.void(), { method: 'DELETE' }),

  getCierresPaged: (page: number, pageSize = 20) =>
    request<PagedResult<CierreListado>>(`/api/eventos/cierres?page=${page}&pageSize=${pageSize}`,
      PagedResultSchema(CierreListadoSchema)),

  getUsuarios: () =>
    request<{ id: number; nombreUsuario: string; isAdmin: boolean }[]>('/api/usuarios', UsuariosSchema),
  setAdmin: (id: number, isAdmin: boolean) =>
    request<void>(`/api/usuarios/${id}/admin`, z.void(), {
      method: 'PUT',
      body: JSON.stringify({ isAdmin }),
    }),
  createUsuario: (nombreUsuario: string, password: string) =>
    request<{ id: number; nombreUsuario: string; isAdmin: boolean }>('/api/usuarios', z.object({
      id: z.number(),
      nombreUsuario: z.string(),
      isAdmin: z.boolean(),
    }), {
      method: 'POST',
      body: JSON.stringify({ nombreUsuario, password }),
    }),
  deleteUsuario: (id: number) =>
    request<void>(`/api/usuarios/${id}`, z.void(), {
      method: 'DELETE',
    }),
}
