import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import type { Evento, CierreCaja as CierreCajaType, ProductoEventoTicket } from '../types/evento'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import { SkeletonCard } from '../components/ui/Skeleton'
import { useTicketRollos, useUpdateTicketRollo } from '../hooks/useTicketRollos'
import { useCerrarEvento } from '../hooks/useEventos'
import { useStock, useUpdateStock } from '../hooks/useStock'
import { buildPdfDoc } from '../utils/pdf'
import { toast } from 'sonner'
import { safeGet } from '../utils/storage'

export default function CierreCaja() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const eventoId = Number(id)
  const [evento, setEvento] = useState<Evento | null>(null)
  const [cierre, setCierre] = useState<CierreCajaType | null>(null)
  const [efectivo, setEfectivo] = useState('')
  const [descuentoManual, setDescuentoManual] = useState('')
  const [loading, setLoading] = useState(true)
  const [cerrando, setCerrando] = useState(false)
  const [descargando, setDescargando] = useState(false)
  const [error, setError] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [confirmarCierreOpen, setConfirmarCierreOpen] = useState(false)
  const [diferenciaNegativaOpen, setDiferenciaNegativaOpen] = useState(false)
  const [finalOverrides, setFinalOverrides] = useState<Record<number, string>>({})
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const { data: stocks = [] } = useStock(eventoId)
  const updateStockMutation = useUpdateStock(eventoId)
  const [consumoOverrides, setConsumoOverrides] = useState<Record<number, string>>({})

  const { data: rollos = [], refetch: refetchRollos } = useTicketRollos(eventoId)
  const updateTicketRollo = useUpdateTicketRollo()
  const cerrarEvento = useCerrarEvento()

  useEffect(() => {
    if (!id) return
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const [ev, ci] = await Promise.all([
          api.getEvento(Number(id)),
          api.getCierre(Number(id)).catch(() => null),
        ])
        if (cancelled) return
        setEvento(ev)
        setCierre(ci)
        if (ci) {
          setEfectivo(String(ci.efectivoEnCaja))
          setDescuentoManual(String(ci.descuentoManual))
        }
      } catch {
        if (!cancelled) navigate('/dashboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [id, navigate])

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    }
  }, [pdfUrl])

  function getFinalValue(rolloId: number): string {
    if (finalOverrides[rolloId] !== undefined) return finalOverrides[rolloId]
    const found = rollos.find((r) => r.id === rolloId)
    return found?.numeroFinal !== null && found?.numeroFinal !== undefined ? String(found.numeroFinal) : ''
  }

  const rollosConFinal = rollos.filter((r) => r.numeroFinal !== null)
  const productoIdsConTicketera = useMemo(() => new Set(rollos.map((r) => r.productoId)), [rollos])
  const faltaStock = useMemo(() => {
    if (rollos.length === 0) return false
    for (const r of rollos) {
      if (!stocks.some((s) => s.productoId === r.productoId)) return true
    }
    return false
  }, [rollos, stocks])

  const totalTickets = rollosConFinal.reduce((s, r) => s + r.ticketsCalculados, 0)
  const totalVendido = rollosConFinal.reduce((s, r) => s + r.subtotal, 0)
  const efectivoNum = Number(efectivo) || 0
  const descuentoNum = Number(descuentoManual) || 0
  const diferencia = efectivoNum + descuentoNum - totalVendido
  const stocksConStock = stocks.filter(s => s.stock > 0 && !s.sinStockNecesario)

  function getConsumoValue(productoId: number): string {
    if (consumoOverrides[productoId] !== undefined) return consumoOverrides[productoId]
    const found = stocks.find((s) => s.productoId === productoId)
    return found ? String(found.consumo) : '0'
  }

  function handleCerrarClick() {
    setError('')
    if (!id) return

    if (diferencia < 0 && descuentoNum === 0) {
      setDiferenciaNegativaOpen(true)
      return
    }

    setConfirmarCierreOpen(true)
  }

  async function confirmarCierre() {
    if (!id) return
    setConfirmarCierreOpen(false)
    setCerrando(true)
    setError('')
    try {
      await cerrarEvento.mutateAsync({ id: Number(id), efectivoEnCaja: efectivoNum, descuentoManual: descuentoNum })
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cerrar')
    } finally {
      setCerrando(false)
    }
  }

  async function guardarNumeroFinal(rolloId: number, numeroFinal: number | null) {
    if (numeroFinal !== null) {
      const rollo = rollos.find((r) => r.id === rolloId)
      if (rollo && numeroFinal < rollo.numeroInicial) {
        toast.error(`El número final no puede ser menor a ${rollo.numeroInicial}`)
        return
      }
    }
    try {
      await updateTicketRollo.mutateAsync({ eventoId, id: rolloId, numeroFinal })
      toast.success('Guardado')
    } catch {
      toast.error('Error al guardar')
    }
  }

  async function toggleCompletada(rollo: ProductoEventoTicket) {
    try {
      await updateTicketRollo.mutateAsync({ eventoId, id: rollo.id, completada: !rollo.completada })
    } catch {
      toast.error('Error al guardar')
    }
  }

  async function guardarConsumo(productoId: number, consumo: number) {
    const items = stocks.map((s) => ({
      productoId: s.productoId,
      productoNombre: s.productoNombre,
      stock: s.stock,
      consumo: s.productoId === productoId ? consumo : s.consumo,
      sinStockNecesario: s.sinStockNecesario ?? false,
    }))
    updateStockMutation.mutate(items, {
      onSuccess: () => {
        setConsumoOverrides((prev) => {
          const next = { ...prev }
          delete next[productoId]
          return next
        })
      },
      onError: () => {
        toast.error('Error al guardar consumo')
      },
    })
  }

  const nombreLocal = safeGet('nombreLocal') || 'CACHENGUE CLUB'

  const descargarPDF = useCallback(async () => {
    if (!id || !evento || !cierre) return
    setDescargando(true)
    try {
      const { data: freshRollos } = await refetchRollos()
      const docs = freshRollos ?? rollos
      const doc = buildPdfDoc(evento, cierre, docs, nombreLocal, stocks)
      doc.save(`cierre_${new Date(evento.fecha).toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('Error al generar PDF:', error)
      alert('Error al generar el PDF')
    } finally {
      setDescargando(false)
    }
  }, [id, evento, cierre, rollos, refetchRollos, nombreLocal, stocks])

  const vistaPrevia = useCallback(async () => {
    if (!id || !evento || !cierre) return
    setDescargando(true)
    try {
      const { data: freshRollos } = await refetchRollos()
      const docs = freshRollos ?? rollos
      const doc = buildPdfDoc(evento, cierre, docs, nombreLocal, stocks)
      const blob = doc.output('blob')
      const url = URL.createObjectURL(blob as Blob)
      setPdfUrl(url)
      setPreviewOpen(true)
    } catch (error) {
      console.error('Error al generar PDF:', error)
      alert('Error al generar el PDF')
    } finally {
      setDescargando(false)
    }
  }, [id, evento, cierre, rollos, refetchRollos, nombreLocal, stocks])
 
  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (!evento) return null

  const isCerrado = cierre !== null

  return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white drop-shadow-[0_0_6px_rgba(232,121,249,0.15)]">
          Cierre de caja
        </h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="rounded-lg border border-borde/50 px-3 py-1.5 text-sm text-primary transition-all duration-200 hover:border-primary/50 hover:bg-primary/5"
        >
          ← Volver
        </button>
      </div>

      {isCerrado ? (
        <Card title="✅ Evento cerrado" variant="glass">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-200">Total vendido</span>
              <span className="font-bold text-white">${cierre.totalVendido.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-200">Efectivo en caja</span>
              <span className="font-bold text-white">${cierre.efectivoEnCaja.toFixed(2)}</span>
            </div>
            {cierre.descuentoManual > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-200">Descuento manual</span>
                <span className="font-bold text-secondary">-${cierre.descuentoManual.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-borde/30 pt-2">
              <span className="text-gray-200">Diferencia</span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-bold ${
                cierre.diferencia >= 0 ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
              }`}>
                {cierre.diferencia >= 0 ? '+' : ''}${cierre.diferencia.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-gray-300">
              Cerrado el {new Date(cierre.fechaHoraCierre).toLocaleString()}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              ← Volver al Dashboard
            </Button>
            <Button variant="ghost" onClick={vistaPrevia} loading={descargando}>
              👁 Vista previa
            </Button>
            <Button onClick={descargarPDF} loading={descargando}>
              📄 Descargar PDF
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <Card title={`📅 Evento del ${new Date(evento.fecha).toLocaleDateString('es-AR', { timeZone: 'UTC' })}`} className="border-primary/30">
            <div className="mb-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-200">Total vendido</span>
                <span className="text-xl font-bold text-primary">${totalVendido.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-200">Tickets emitidos</span>
                <span className="font-bold text-white">{totalTickets}</span>
              </div>
              {rollos.length > 0 && rollos.every((r) => r.numeroFinal === null) && (
                <p className="text-xs text-yellow-500">
                  Completá al menos una ticketera para ver el total
                </p>
              )}
            </div>
          </Card>

          <Card title="🎟️ Ticketeras">
            {rollos.length === 0 ? (
              <p className="text-sm text-gray-300">No hay ticketeras cargadas para este evento</p>
            ) : (
              <div className="space-y-2">
                {rollos.map((r) => (
                  <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-borde/50 px-3 py-2 transition-all duration-200 hover:border-primary/30 hover:bg-white/2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-white">{r.productoNombre}</span>
                      <span className="text-xs text-gray-300">{r.numeroInicial} →</span>
                      <input
                        type="number"
                        min={r.numeroInicial}
                        value={getFinalValue(r.id)}
                        onChange={(e) => setFinalOverrides((prev) => ({ ...prev, [r.id]: e.target.value }))}
                        onBlur={(e) => {
                          const val = e.target.value
                          if (val === '') {
                            guardarNumeroFinal(r.id, null)
                          } else {
                            guardarNumeroFinal(r.id, Number(val))
                          }
                        }}
                        placeholder="Último n°"
                        className="w-20 rounded border border-borde/50 bg-fondo px-2 py-1 text-sm text-white outline-none transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_2px_rgba(232,121,249,0.25)]"
                      />
                      <label className="flex cursor-pointer items-center gap-1 text-xs text-gray-300">
                        <input
                          type="checkbox"
                          checked={r.completada}
                          onChange={() => toggleCompletada(r)}
                          className="accent-primary size-3.5"
                        />
                        Completada
                      </label>
                    </div>
                    {r.numeroFinal !== null && (
                      <span className="text-xs text-gray-300">
                        {r.ticketsCalculados} tickets · ${r.subtotal.toFixed(2)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {stocksConStock.length > 0 && (
            <Card title="📊 Stock vs Tickets">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-borde/30 text-gray-300">
                      <th className="pb-2 pr-2">Producto</th>
                      <th className="hidden pb-2 pr-2 text-right lg:table-cell">Stock Recibido</th>
                      <th className="pb-2 pr-2 text-right">Vendidos</th>
                      <th className="hidden pb-2 pr-2 text-right md:table-cell">Consumo</th>
                      <th className="pb-2 text-right">Devolver</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stocksConStock.map((s) => {
                      const vendidos = rollos
                        .filter((r) => r.productoId === s.productoId)
                        .reduce((sum, r) => sum + r.ticketsCalculados, 0)
                      const consumoVal = Number(getConsumoValue(s.productoId)) || 0
                      const devolver = Math.max(0, s.stock - vendidos - consumoVal)
                      return (
                        <tr key={s.productoId} className="border-b border-borde/20 transition-all duration-200 hover:bg-white/2">
                          <td className="py-2 pr-2 text-white">{s.productoNombre}</td>
                          <td className="hidden py-2 pr-2 text-right text-gray-300 lg:table-cell">{s.stock}</td>
                          <td className="py-2 pr-2 text-right text-gray-300">
                            {productoIdsConTicketera?.has(s.productoId) ? vendidos : '—'}
                          </td>
                          <td className="hidden py-2 pr-2 text-right md:table-cell">
                            <input
                              type="number"
                              min={0}
                              value={getConsumoValue(s.productoId)}
                              onChange={(e) => setConsumoOverrides((prev) => ({ ...prev, [s.productoId]: e.target.value }))}
                              onBlur={(e) => {
                                const val = Number(e.target.value) || 0
                                guardarConsumo(s.productoId, val)
                              }}
                              placeholder="0"
                              className="w-14 rounded border border-borde/50 bg-fondo px-1.5 py-0.5 text-right text-sm text-white outline-none transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_2px_rgba(232,121,249,0.25)]"
                            />
                          </td>
                          <td className="py-2 text-right font-semibold text-primary">{devolver}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Consumo: productos retirados sin cargo (autorizados por el dueño).
              </p>
            </Card>
          )}

          <Card title="🔒 Cerrar evento" className="border-red-500/20">
            <div className="space-y-4">
              <Input
                label="Efectivo real en caja ($)"
                type="number"
                min={0}
                step="0.01"
                value={efectivo}
                onChange={(e) => setEfectivo(e.target.value)}
                placeholder="0.00"
              />

              <div>
                <Input
                  label="Descuento manual ($) — opcional"
                  type="number"
                  min={0}
                  step="0.01"
                  value={descuentoManual}
                  onChange={(e) => setDescuentoManual(e.target.value)}
                  placeholder="0.00"
                />
                <p className="mt-1 text-xs text-gray-300">
                  Si el dueño cobró menos a algún conocido, ingresá el monto descontado para que la diferencia cierre en 0.
                </p>
              </div>
            </div>

            <div className="my-4 flex items-center justify-between rounded-lg bg-black/30 p-3">
              <span className="text-gray-200">Diferencia</span>
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-lg font-bold ${
                diferencia >= 0 ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
              }`}>
                {diferencia >= 0 ? '+' : ''}${diferencia.toFixed(2)}
              </span>
            </div>

            {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

            {rollos.length === 0 && stocksConStock.length === 0 && (
              <p className="mb-3 text-sm text-yellow-500">
                ⚠️ No hay ticketeras ni stock definido. Usá "Desactivar evento" si no hubo actividad.
              </p>
            )}

            {faltaStock && (
              <p className="mb-3 text-sm text-yellow-500">
                ⚠️ Definí el stock de todos los productos con ticketera antes de cerrar.
              </p>
            )}

            <Button
              onClick={handleCerrarClick}
              loading={cerrando}
              disabled={efectivo === '' || faltaStock || (rollos.length === 0 && stocksConStock.length === 0)}
            >
              Cerrar evento
            </Button>
          </Card>
        </>
      )}

      <Modal
        open={confirmarCierreOpen}
        onOpenChange={(open) => { if (!open) setConfirmarCierreOpen(false) }}
        title="Confirmar cierre de caja"
      >
        <p className="mb-6 text-sm text-gray-200">
          ¿Confirmar cierre de caja? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setConfirmarCierreOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={confirmarCierre} loading={cerrando}>
            Confirmar cierre
          </Button>
        </div>
      </Modal>

      <Modal
        open={diferenciaNegativaOpen}
        onOpenChange={(open) => { if (!open) setDiferenciaNegativaOpen(false) }}
        title="Diferencia negativa"
      >
        <p className="mb-4 text-sm text-gray-200">
          La diferencia está en <span className="font-bold text-red-400">${diferencia.toFixed(2)}</span> y no ingresaste descuento manual.
        </p>
        <p className="mb-6 text-sm text-gray-200">
          Si el dueño hizo algún descuento, ingresalo en el campo "Descuento manual" antes de cerrar.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDiferenciaNegativaOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              setDiferenciaNegativaOpen(false)
              setConfirmarCierreOpen(true)
            }}
          >
            Cerrar igual
          </Button>
        </div>
      </Modal>

      <Modal
        open={previewOpen}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewOpen(false)
            if (pdfUrl) URL.revokeObjectURL(pdfUrl)
            setPdfUrl(null)
          }
        }}
        title="Vista previa — Cierre de Caja"
        maxWidth="max-w-5xl"
      >
        <div className="flex flex-col items-center gap-4">
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              className="h-[70vh] w-full rounded border border-borde/30"
            />
          )}
          <Button onClick={() => { descargarPDF(); setPreviewOpen(false) }}>
            Descargar PDF
          </Button>
        </div>
      </Modal>
    </div>
  )
}
