import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEventos, useAbrirEvento, useDesactivarEvento } from '../hooks/useEventos'
import { useReporte } from '../hooks/useReporte'
import { useProductos } from '../hooks/useProductos'
import { useTicketRollos, useCreateTicketRollo } from '../hooks/useTicketRollos'
import { useStock, useUpdateStock } from '../hooks/useStock'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import TicketerasSection from '../components/sections/TicketerasSection'
import { SkeletonCard, Skeleton } from '../components/ui/Skeleton'
import { formatDateLocal } from '../utils/dates'
import { toast } from 'sonner'

export default function Dashboard() {
  const navigate = useNavigate()
  const { data: eventos = [], isLoading: loading } = useEventos()
  const hoy = new Date().toISOString().split('T')[0]
  const { data: reporteHoy } = useReporte(hoy, hoy)
  const { data: productos = [] } = useProductos()
  const abrirEvento = useAbrirEvento()

  const eventoActivo = eventos.find((e) => e.estado === 'Abierto')
  const [fechaNuevoEvento, setFechaNuevoEvento] = useState(new Date().toISOString().split('T')[0])
  const [desactivarOpen, setDesactivarOpen] = useState(false)
  const desactivarEvento = useDesactivarEvento()

  const { data: stocks = [] } = useStock(eventoActivo?.id)
  const updateStock = useUpdateStock(eventoActivo?.id)
  const [stockOverrides, setStockOverrides] = useState<Record<number, string>>({})
  const [sinStockNecesarioOverrides, setSinStockNecesarioOverrides] = useState<Record<number, boolean>>({})
  const [gestionarOpen, setGestionarOpen] = useState(false)
  const [crearTicketera, setCrearTicketera] = useState<{ productoId: number; productoNombre: string } | null>(null)
  const [numeroInicialCrear, setNumeroInicialCrear] = useState('')

  const { data: rollos = [] } = useTicketRollos(eventoActivo?.id)
  const createTicketRollo = useCreateTicketRollo()

  function getStockValue(productoId: number): string {
    if (stockOverrides[productoId] !== undefined) return stockOverrides[productoId]
    const found = stocks.find((s) => s.productoId === productoId)
    return found ? String(found.stock) : ''
  }

  function getSinStockNecesario(productoId: number): boolean {
    if (sinStockNecesarioOverrides[productoId] !== undefined) return sinStockNecesarioOverrides[productoId]
    const found = stocks.find((s) => s.productoId === productoId)
    return found?.sinStockNecesario ?? false
  }

  async function guardarStock() {
    const items = productos.map((p) => ({
      productoId: p.id,
      productoNombre: p.nombre,
      stock: Number(getStockValue(p.id)) || 0,
      consumo: 0,
      sinStockNecesario: getSinStockNecesario(p.id),
    }))
    updateStock.mutate(items, {
      onSuccess: () => {
        setStockOverrides({})
        setSinStockNecesarioOverrides({})
        toast.success('Stock guardado')
      },
      onError: () => {
        toast.error('Error al guardar stock')
      },
    })
  }

  const productoIdsConTicketera = new Set(rollos.map((r) => r.productoId))
  const productosSinTicketera = productos.filter((p) => !productoIdsConTicketera.has(p.id))
  const productosAgotados = productos.filter(
    (p) => productoIdsConTicketera.has(p.id) && stocks.some((s) => s.productoId === p.id && s.stock === 0)
  )
  const faltaStock = eventoActivo !== null && rollos.some((r) => !stocks.some((s) => s.productoId === r.productoId))

  const itemsHoy = reporteHoy?.items ?? []
  const totalHoy = reporteHoy?.totalNeto ?? 0
  const topProducto = itemsHoy.toSorted((a, b) => b.cantidadTotal - a.cantidadTotal)[0]
  const totalCantHoy = itemsHoy.reduce((s, r) => s + r.cantidadTotal, 0)

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
        <Skeleton className="mb-4 h-8 w-1/3" />
        <SkeletonCard />
        <div className="grid grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonCard />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-white drop-shadow-[0_0_6px_rgba(232,121,249,0.15)]">
        Dashboard
      </h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <p className="text-xs text-gray-300">💰 Hoy</p>
          <p className="text-xl font-bold text-primary">${totalHoy.toFixed(2)}</p>
        </Card>
        <Card className="border-l-4 border-l-secondary">
          <p className="text-xs text-gray-300">⭐ Top producto</p>
          <p className="truncate text-lg font-bold text-white">{topProducto?.producto ?? '—'}</p>
        </Card>
        <Card className="border-l-4 border-l-white/30">
          <p className="text-xs text-gray-300">🎟️ Tickets</p>
          <p className="text-xl font-bold text-white">{totalCantHoy}</p>
        </Card>
      </div>

      {/* Evento activo */}
      {eventoActivo ? (
        <Card title={`📅 Evento activo — ${formatDateLocal(eventoActivo.fecha)}`} className="border-primary/30">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg bg-primary/5 p-3">
              <p className="text-2xl font-bold text-primary">${eventoActivo.totalVendido.toFixed(2)}</p>
              <p className="text-xs text-gray-300">Vendido</p>
            </div>
            <div className="rounded-lg bg-secondary/5 p-3">
              <p className="text-2xl font-bold text-secondary">{eventoActivo.totalTickets}</p>
              <p className="text-xs text-gray-300">Tickets</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => {
                if (!faltaStock) navigate(`/cierre/${eventoActivo.id}`)
                else toast.error('Definí el stock de todos los productos antes de cerrar caja')
              }}
              className="flex-1"
            >
              Cerrar caja
            </Button>
            <Button variant="ghost" onClick={() => setDesactivarOpen(true)}>
              ✕ Desactivar
            </Button>
          </div>
        </Card>
      ) : (
        <Card title="📅 No hay evento activo" className="border-dashed border-2 border-borde/30">
          <p className="mb-4 text-sm text-gray-200">
            Abrí un nuevo evento para empezar a cargar tickets.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={fechaNuevoEvento}
              onChange={(e) => setFechaNuevoEvento(e.target.value)}
              className="w-full rounded-lg border border-borde bg-fondo px-4 py-3 text-white outline-none transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_2px_rgba(232,121,249,0.25)]"
            />
            <Button onClick={() => abrirEvento.mutate(fechaNuevoEvento)} loading={abrirEvento.isPending}>
              Abrir
            </Button>
          </div>
        </Card>
      )}

      {/* Ticketeras */}
      {eventoActivo && (
        <TicketerasSection
          key={eventoActivo.id}
          eventoActivo={eventoActivo}
          productos={productos}
        />
      )}

      {/* Stock */}
      {eventoActivo && (
        <Card title="📦 Stock">
          {productosSinTicketera.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-sm font-semibold text-gray-300">Productos sin ticketera</p>
              <div className="space-y-2">
                {productosSinTicketera.map((p) => {
                  const desactivado = getSinStockNecesario(p.id)
                  return (
                    <div key={p.id} className={`flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 transition-all duration-200 ${desactivado ? 'border-gray-700/50 bg-gray-800/20 opacity-50' : 'border-borde/50 hover:border-primary/30'}`}>
                      <label className="flex cursor-pointer items-center gap-1 text-xs text-gray-300">
                        <input
                          type="checkbox"
                          checked={desactivado}
                          onChange={() => setSinStockNecesarioOverrides((prev) => ({ ...prev, [p.id]: !getSinStockNecesario(p.id) }))}
                          className="accent-primary size-3.5"
                        />
                      </label>
                      <span className={`min-w-25 text-sm ${desactivado ? 'text-gray-500 line-through' : 'text-white'}`}>{p.nombre}</span>
                      {!desactivado && (
                        <>
                          <input
                            type="number"
                            min={0}
                            value={getStockValue(p.id)}
                            onChange={(e) => setStockOverrides((prev) => ({ ...prev, [p.id]: e.target.value }))}
                            placeholder="Stock"
                            className="w-20 rounded border border-borde/50 bg-fondo px-2 py-1 text-sm text-white outline-none transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_2px_rgba(232,121,249,0.25)]"
                          />
                          <button
                            onClick={() => setCrearTicketera({ productoId: p.id, productoNombre: p.nombre })}
                            disabled={!getStockValue(p.id) || Number(getStockValue(p.id)) === 0}
                            title={!getStockValue(p.id) || Number(getStockValue(p.id)) === 0 ? 'Definí stock primero' : undefined}
                            className={`ml-auto rounded-lg px-2 py-1 text-xs font-semibold transition-all duration-200 ${
                              !getStockValue(p.id) || Number(getStockValue(p.id)) === 0
                                ? 'cursor-not-allowed text-gray-500'
                                : 'text-primary hover:bg-primary/10 hover:shadow-[0_0_8px_rgba(232,121,249,0.15)]'
                            }`}
                          >
                            + Crear ticketera
                          </button>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {productosAgotados.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-sm font-semibold text-gray-300">Agotados</p>
              <div className="space-y-1">
                {productosAgotados.map((p) => (
                  <p key={p.id} className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-400">
                    {p.nombre} — Agotado
                  </p>
                ))}
              </div>
            </div>
          )}
          {productosSinTicketera.length === 0 && productosAgotados.length === 0 && (
            <p className="mb-4 text-sm text-gray-300">Todos los productos tienen stock definido.</p>
          )}
          <div className="flex gap-2">
            <Button onClick={guardarStock} className="flex-1" disabled={Object.keys(stockOverrides).length === 0 && Object.keys(sinStockNecesarioOverrides).length === 0}>
              Guardar stock
            </Button>
            <Button variant="ghost" onClick={() => setGestionarOpen(true)}>
              Gestionar stock
            </Button>
          </div>
        </Card>
      )}

      {/* Modal crear ticketera */}
      <Modal
        open={!!crearTicketera}
        onOpenChange={(o) => { if (!o) setCrearTicketera(null) }}
        title={`Crear ticketera — ${crearTicketera?.productoNombre ?? ''}`}
      >
        {crearTicketera && (
          <form onSubmit={async (e) => {
            e.preventDefault()
            const val = Number(numeroInicialCrear)
            if (val < 1) { toast.error('El número debe ser mayor o igual a 1'); return }
            await createTicketRollo.mutateAsync({
              eventoId: eventoActivo!.id,
              data: { productoId: crearTicketera.productoId, numeroInicial: val },
            })
            setCrearTicketera(null)
            setNumeroInicialCrear('')
          }}>
            <p className="mb-4 text-sm text-gray-200">
              Creando ticketera para <span className="text-white">{crearTicketera.productoNombre}</span>
            </p>
            <Input
              label="Número inicial"
              type="number"
              min={1}
              value={numeroInicialCrear}
              onChange={(e) => setNumeroInicialCrear(e.target.value)}
            />
            <div className="mt-4 flex gap-3">
              <Button type="button" variant="secondary" onClick={() => setCrearTicketera(null)}>
                Cancelar
              </Button>
              <Button type="submit" loading={createTicketRollo.isPending}>
                Crear
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal gestionar stock */}
      <Modal
        open={gestionarOpen}
        onOpenChange={(open) => { if (!open) setGestionarOpen(false) }}
        title="Gestionar stock"
        maxWidth="max-w-xl"
      >
        <div className="space-y-3">
          {productos.filter((p) => productoIdsConTicketera.has(p.id)).map((p) => (
            <div key={p.id} className="flex items-center gap-2 rounded-lg border border-borde/50 px-3 py-2">
              <span className="min-w-25 text-sm text-white">{p.nombre}</span>
              <input
                type="number"
                min={0}
                value={getStockValue(p.id)}
                onChange={(e) => setStockOverrides((prev) => ({ ...prev, [p.id]: e.target.value }))}
                placeholder="Stock"
                className="w-20 rounded border border-borde/50 bg-fondo px-2 py-1 text-sm text-white outline-none transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_2px_rgba(232,121,249,0.25)]"
              />
            </div>
          ))}
          {productos.filter((p) => productoIdsConTicketera.has(p.id)).length === 0 && (
            <p className="text-sm text-gray-300">No hay productos cargados.</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setGestionarOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                await guardarStock()
                setGestionarOpen(false)
              }}
              disabled={Object.keys(stockOverrides).length === 0}
            >
              Guardar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={desactivarOpen}
        onOpenChange={(open) => { if (!open) setDesactivarOpen(false) }}
        title="Desactivar evento"
      >
        <p className="mb-6 text-sm text-gray-200">
          ¿Cerrar evento sin cierre de caja? El evento se marcará como cerrado y no se podrán cargar
          más ticketeras ni registrar caja. Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDesactivarOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              desactivarEvento.mutate(eventoActivo!.id, {
                onSuccess: () => setDesactivarOpen(false),
              })
            }}
            loading={desactivarEvento.isPending}
          >
            Desactivar evento
          </Button>
        </div>
      </Modal>
    </div>
  )
}
