import { useState, useMemo, useCallback } from 'react'
import * as XLSX from 'xlsx-js-style'
import { useReporte } from '../hooks/useReporte'
import { useProductos } from '../hooks/useProductos'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { SkeletonTable } from '../components/ui/Skeleton'
import { formatDateLocal } from '../utils/dates'
import { buildReportePdfDoc } from '../utils/pdf'
import { safeGet } from '../utils/storage'

export default function Reportes() {
  const hoy = new Date().toISOString().split('T')[0]
  const [desde, setDesde] = useState(hoy)
  const [hasta, setHasta] = useState(hoy)
  const [productoId, setProductoId] = useState<number | ''>('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)

  const { data: productos = [] } = useProductos()
  const { data: reporte, isLoading: loading } = useReporte(desde, hasta, productoId || undefined)

  const items = useMemo(() => reporte?.items ?? [], [reporte])
  const totalCantidad = useMemo(() => items.reduce((s, r) => s + r.cantidadTotal, 0), [items])

  const exportarExcel = useCallback(() => {
    if (!reporte) return
        const prodRows = items.map((r) => ({
          Producto: r.producto,
          Cantidad: r.cantidadTotal,
          'Promedio': r.precioPromedioPonderado,
          Bruto: r.totalVendido,
        }))
    const data = [
      ...prodRows,
      { Producto: 'TOTALES', Cantidad: totalCantidad, Bruto: reporte.totalBruto },
      { Producto: 'Descuento', Cantidad: '', Bruto: -reporte.descuentoManual },
      { Producto: 'NETO', Cantidad: '', Bruto: reporte.totalNeto },
    ]

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte')

    const keys = Object.keys(data[0])
    const maxWidths: XLSX.ColInfo[] = keys.map((k) => ({
      wch: Math.max(
        k.length,
        ...data.map((r) => String(Reflect.get(r, k)).length)
      ) + 2,
    }))
    ws['!cols'] = maxWidths

    XLSX.writeFile(wb, `reporte_${desde}_al_${hasta}.xlsx`)
  }, [items, totalCantidad, reporte, desde, hasta])

  const nombreLocal = safeGet('nombreLocal') || 'CACHENGUE CLUB'

  const generarPDF = useCallback(() => {
    if (!reporte) return
    const doc = buildReportePdfDoc(reporte, desde, hasta, nombreLocal)
    doc.save(`reporte_${desde}_al_${hasta}.pdf`)
  }, [reporte, desde, hasta, nombreLocal])

  const vistaPreviaPDF = useCallback(async () => {
    if (!reporte) return
    setPdfLoading(true)
    try {
      const doc = buildReportePdfDoc(reporte, desde, hasta, nombreLocal)
      const blob = doc.output('blob')
      const url = URL.createObjectURL(blob as Blob)
      setPdfUrl(url)
      setPreviewOpen(true)
    } catch {
      alert('Error al generar el PDF')
    } finally {
      setPdfLoading(false)
    }
  }, [reporte, desde, hasta, nombreLocal])

  const titulo = desde === hasta
    ? `Ventas del ${formatDateLocal(desde)}`
    : `Ventas del ${formatDateLocal(desde)} al ${formatDateLocal(hasta)}`

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white drop-shadow-[0_0_6px_rgba(232,121,249,0.15)]">
          Reportes
        </h1>
        {items.length > 0 && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={exportarExcel}>
              📊 Excel
            </Button>
            <Button variant="ghost" onClick={vistaPreviaPDF} loading={pdfLoading}>
              📄 Vista previa PDF
            </Button>
          </div>
        )}
      </div>

      <Card>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm text-gray-200">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="w-full rounded-lg border border-borde/50 bg-fondo px-4 py-3 text-white outline-none transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_2px_rgba(232,121,249,0.25)]"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-200">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="w-full rounded-lg border border-borde/50 bg-fondo px-4 py-3 text-white outline-none transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_2px_rgba(232,121,249,0.25)]"
            />
          </div>
        </div>
        <div className="mt-3">
          <label className="mb-1 block text-sm text-gray-200">Producto</label>
          <select
            value={productoId}
            onChange={(e) => setProductoId(e.target.value ? Number(e.target.value) : '')}
            className="w-full rounded-lg border border-borde/50 bg-fondo px-4 py-3 text-white outline-none transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_2px_rgba(232,121,249,0.25)]"
          >
            <option value="">Todos los productos</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>
      </Card>

      {loading ? (
        <Card title="Cargando...">
          <SkeletonTable rows={3} />
        </Card>
      ) : items.length === 0 ? (
        <Card title="Sin ventas">
          <p className="text-sm text-gray-200">No hay ventas para el período seleccionado.</p>
        </Card>
      ) : (
        <>
          <Card title={titulo}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-borde/30 text-gray-300">
                    <th className="pb-2 pr-2">Producto</th>
                    <th className="pb-2 pr-2 text-right">Cant.</th>
                    <th className="hidden pb-2 pr-2 text-right md:table-cell">Prom.</th>
                    <th className="pb-2 pr-2 text-right">Bruto</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r, i) => (
                    <tr key={r.producto} className={`border-b border-borde/20 transition-all duration-200 hover:bg-white/2 ${i % 2 === 1 ? 'bg-white/1.5' : ''}`}>
                      <td className="py-2 pr-2 text-white">{r.producto}</td>
                      <td className="py-2 pr-2 text-right text-gray-300">{r.cantidadTotal}</td>
                      <td className="hidden py-2 pr-2 text-right text-gray-300 md:table-cell">${r.precioPromedioPonderado.toFixed(2)}</td>
                      <td className="py-2 pr-2 text-right text-gray-300">${r.totalVendido.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-borde/30 font-bold text-white">
                    <td className="pt-3 pr-2">TOTALES</td>
                    <td className="pt-3 pr-2 text-right">{totalCantidad}</td>
                    <td className="pt-3 pr-2"></td>
                    <td className="pt-3 pr-2 text-right">${reporte!.totalBruto.toFixed(2)}</td>
                  </tr>
                  <tr className="text-sm text-gray-300">
                    <td className="pt-1 pr-2">Descuento</td>
                    <td className="pt-1 pr-2"></td>
                    <td className="pt-1 pr-2"></td>
                    <td className="pt-1 pr-2 text-right text-secondary">-${reporte!.descuentoManual.toFixed(2)}</td>
                  </tr>
                  <tr className="font-bold text-white">
                    <td className="pt-1 pr-2">NETO</td>
                    <td className="pt-1 pr-2"></td>
                    <td className="pt-1 pr-2"></td>
                    <td className="pt-1 pr-2 text-right text-primary drop-shadow-[0_0_4px_rgba(232,121,249,0.3)]">
                      ${reporte!.totalNeto.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </>
      )}

      <Modal
        open={previewOpen}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewOpen(false)
            if (pdfUrl) URL.revokeObjectURL(pdfUrl)
            setPdfUrl(null)
          }
        }}
        title="Vista previa — Reporte"
        maxWidth="max-w-5xl"
      >
        <div className="flex flex-col items-center gap-4">
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              className="h-[70vh] w-full rounded border border-borde/30"
            />
          )}
          <Button onClick={() => { generarPDF(); setPreviewOpen(false) }}>
            Descargar PDF
          </Button>
        </div>
      </Modal>
    </div>
  )
}
