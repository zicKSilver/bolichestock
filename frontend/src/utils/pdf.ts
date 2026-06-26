import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { ProductoEventoTicket, StockItem } from '../types/evento'
import type { ReporteGeneral } from '../types/reporte'

interface CierreData {
  totalVendido: number
  efectivoEnCaja: number
  descuentoManual: number
  diferencia: number
  fechaHoraCierre: string
}

interface EventoData {
  fecha: string
}

export function buildPdfDoc(
  evento: EventoData,
  cierre: CierreData,
  rollos: ProductoEventoTicket[],
  nombreLocal: string,
  stocks: StockItem[] = [],
): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  let y = 20

  doc.setFontSize(18).setFont('helvetica', 'bold')
  doc.text(nombreLocal, pageW / 2, y, { align: 'center' })
  y += 8

  doc.setFontSize(14).setFont('helvetica', 'normal')
  doc.text('Cierre de Caja', pageW / 2, y, { align: 'center' })
  y += 10

  doc.setFontSize(10).setFont('helvetica', 'normal')
  doc.text(`Evento: ${new Date(evento.fecha).toLocaleDateString('es-AR', { timeZone: 'UTC' })}`, 20, y)
  doc.text(`Cerrado: ${new Date(cierre.fechaHoraCierre).toLocaleString()}`, pageW - 20, y, { align: 'right' })
  y += 12

  doc.setDrawColor(200).line(20, y, pageW - 20, y)
  y += 8

  const colorDiff = cierre.diferencia >= 0
    ? [34, 197, 94] as [number, number, number]
    : [239, 68, 68] as [number, number, number]

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Total Vendido:', 20, y)
  doc.setFont('helvetica', 'bold')
  doc.text(`$${cierre.totalVendido.toFixed(2)}`, pageW - 20, y, { align: 'right' })
  y += 7

  doc.setFont('helvetica', 'normal')
  doc.text('Efectivo en Caja:', 20, y)
  doc.setFont('helvetica', 'bold')
  doc.text(`$${cierre.efectivoEnCaja.toFixed(2)}`, pageW - 20, y, { align: 'right' })
  y += 7

  if (cierre.descuentoManual > 0) {
    doc.setFont('helvetica', 'normal')
    doc.text('Descuento Manual:', 20, y)
    doc.setFont('helvetica', 'bold')
    doc.text(`$${cierre.descuentoManual.toFixed(2)}`, pageW - 20, y, { align: 'right' })
    y += 7
  }

  doc.setFont('helvetica', 'normal')
  doc.text('Diferencia:', 20, y)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...colorDiff)
  doc.text(`$${cierre.diferencia.toFixed(2)}`, pageW - 20, y, { align: 'right' })
  doc.setTextColor(0)
  y += 14

  doc.setDrawColor(200).line(20, y - 2, pageW - 20, y - 2)
  y += 2

  doc.setFontSize(12).setFont('helvetica', 'bold')
  doc.text('Detalle por Rollo', 20, y)
  y += 8

  const rows = rollos.map((r) => [
    r.productoNombre,
    `${r.numeroInicial} > ${r.numeroFinal ?? '—'}`,
    r.ticketsCalculados.toString(),
    `$${r.subtotal.toFixed(2)}`,
    r.completada ? 'Completo' : '',
  ])

  const totalTkts = rollos.reduce((s, r) => s + r.ticketsCalculados, 0)
  const totalSubtotal = rollos.reduce((s, r) => s + r.subtotal, 0)

  autoTable(doc, {
    startY: y,
    head: [['Producto', 'Rango', 'Tickets', 'Subtotal', 'Estado']],
    body: rows,
    foot: [[
      { content: `${rollos.length} rollos`, colSpan: 2, styles: { fontStyle: 'bold', halign: 'left' } },
      { content: totalTkts.toString(), styles: { fontStyle: 'bold', halign: 'center' } },
      { content: `$${totalSubtotal.toFixed(2)}`, styles: { fontStyle: 'bold', halign: 'right' } },
      { content: '', styles: { fontStyle: 'bold' } },
    ]],
    theme: 'grid',
    headStyles: {
      fillColor: [255, 105, 180],
      textColor: 255,
      fontStyle: 'bold',
    },
    footStyles: {
      fillColor: [240, 240, 240],
      textColor: 0,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 34, halign: 'center' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 24, halign: 'right' },
      4: { cellWidth: 28, halign: 'center' },
    },
    margin: { left: 20, right: 20 },
  })

  const stocksConStock = stocks.filter(s => s.stock > 0 && !s.sinStockNecesario)
  if (stocksConStock.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lastTable = (doc as any).lastAutoTable
    y = (lastTable?.finalY ?? y) + 14

    const productoIdsConTicketera = new Set(rollos.map((r) => r.productoId))

    const stockRows = stocksConStock.map((s) => {
      const vendidos = rollos
        .filter((r) => r.productoId === s.productoId)
        .reduce((sum, r) => sum + r.ticketsCalculados, 0)
      const consumo = s.consumo || 0
      const devolver = Math.max(0, s.stock - vendidos - consumo)
      return [
        s.productoNombre,
        s.stock.toString(),
        productoIdsConTicketera.has(s.productoId) ? vendidos.toString() : '—',
        consumo > 0 ? consumo.toString() : '—',
        devolver.toString(),
      ]
    })

    doc.setFontSize(12).setFont('helvetica', 'bold')
    doc.text('Stock vs Devolución', 20, y)
    y += 8

    autoTable(doc, {
      startY: y,
      head: [['Producto', 'Stock Recibido', 'Vendidos', 'Consumo', 'Devolver']],
      body: stockRows,
      theme: 'grid',
      headStyles: { fillColor: [255, 105, 180], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 26, halign: 'center' },
        2: { cellWidth: 22, halign: 'center' },
        3: { cellWidth: 22, halign: 'center' },
        4: { cellWidth: 22, halign: 'center' },
      },
      margin: { left: 20, right: 20 },
    })
  }

  return doc
}

export function buildReportePdfDoc(
  reporte: ReporteGeneral,
  desde: string,
  hasta: string,
  nombreLocal: string,
): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  let y = 20

  doc.setFontSize(18).setFont('helvetica', 'bold')
  doc.text(nombreLocal, pageW / 2, y, { align: 'center' })
  y += 8

  doc.setFontSize(14).setFont('helvetica', 'normal')
  const titulo = desde === hasta
    ? `Ventas del ${new Date(desde).toLocaleDateString('es-AR')}`
    : `Ventas del ${new Date(desde).toLocaleDateString('es-AR')} al ${new Date(hasta).toLocaleDateString('es-AR')}`
  doc.text(titulo, pageW / 2, y, { align: 'center' })
  y += 14

  const totalCantidad = reporte.items.reduce((s, r) => s + r.cantidadTotal, 0)

  const rows = reporte.items.map((r) => [
    r.producto,
    r.cantidadTotal.toString(),
    `$${r.totalVendido.toFixed(2)}`,
  ])

  autoTable(doc, {
    startY: y,
    head: [['Producto', 'Cant.', 'Bruto']],
    body: rows,
    foot: [
      [
        { content: 'TOTALES', colSpan: 1, styles: { fontStyle: 'bold', halign: 'left' } },
        { content: totalCantidad.toString(), styles: { fontStyle: 'bold', halign: 'center' } },
        { content: `$${reporte.totalBruto.toFixed(2)}`, styles: { fontStyle: 'bold', halign: 'right' } },
      ],
      [
        { content: 'Descuento', colSpan: 1, styles: { fontStyle: 'normal', halign: 'left' } },
        { content: '', styles: { fontStyle: 'normal' } },
        { content: `-$${reporte.descuentoManual.toFixed(2)}`, styles: { fontStyle: 'normal', halign: 'right' } },
      ],
      [
        { content: 'NETO', colSpan: 1, styles: { fontStyle: 'bold', halign: 'left' } },
        { content: '', styles: { fontStyle: 'bold' } },
        { content: `$${reporte.totalNeto.toFixed(2)}`, styles: { fontStyle: 'bold', halign: 'right' } },
      ],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [255, 105, 180],
      textColor: 255,
      fontStyle: 'bold',
    },
    footStyles: {
      fillColor: [240, 240, 240],
      textColor: 0,
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 28, halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  })

  return doc
}
