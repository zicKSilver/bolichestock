import { describe, it, expect } from 'vitest'
import { buildPdfDoc } from '../pdf'
import type { ProductoEventoTicket } from '../../types/evento'

describe('buildPdfDoc', () => {
  it('returns a jsPDF instance without throwing', () => {
    const evento = { fecha: '2026-06-15T00:00:00.000Z' }
    const cierre = {
      totalVendido: 5000,
      efectivoEnCaja: 4800,
      descuentoManual: 0,
      diferencia: -200,
      fechaHoraCierre: '2026-06-15T23:00:00.000Z',
    }
    const rollos: ProductoEventoTicket[] = [
      {
        id: 1,
        eventoId: 1,
        productoId: 1,
        productoNombre: 'FICHAS X 1',
        productoPrecio: 20,
        numeroInicial: 1,
        numeroFinal: 50,
        totalTicketera: 250,
        completada: true,
        ticketsCalculados: 50,
        subtotal: 1000,
      },
    ]

    const doc = buildPdfDoc(evento, cierre, rollos, 'CACHENGUE CLUB')

    expect(doc).toBeDefined()
    expect(typeof doc.save).toBe('function')
    expect(typeof doc.output).toBe('function')
  })
})
