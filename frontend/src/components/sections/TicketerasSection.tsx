import { useState } from 'react'
import { useTicketRollosPaged, useUpdateTicketRollo, useCreateTicketRollo, useDeleteTicketRollo } from '../../hooks/useTicketRollos'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Pagination from '../ui/Pagination'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import { toast } from 'sonner'
import type { ProductoEventoTicket, Evento } from '../../types/evento'
import type { Producto } from '../../types/producto'

interface Props {
  eventoActivo: Evento
  productos: Producto[]
}

const coloresPorProducto = [
  'border-l-primary',
  'border-l-secondary',
  'border-l-blue-400',
  'border-l-green-400',
  'border-l-yellow-400',
  'border-l-orange-400',
  'border-l-cyan-400',
  'border-l-pink-400',
]

export default function TicketerasSection({ eventoActivo, productos }: Props) {
  const [eliminandoRollo, setEliminandoRollo] = useState<ProductoEventoTicket | null>(null)
  const [editandoRollo, setEditandoRollo] = useState<{ rollo: ProductoEventoTicket; numeroInicial: string } | null>(null)
  const [errorEditar, setErrorEditar] = useState('')
  const [pagina, setPagina] = useState(1)
  const [nuevoRollo, setNuevoRollo] = useState<{ rollo: ProductoEventoTicket; ultimoNumero: string } | null>(null)
  const [errorNuevo, setErrorNuevo] = useState('')
  const [deshaciendoRollo, setDeshaciendoRollo] = useState<ProductoEventoTicket | null>(null)

  const { data: rollosPaged } = useTicketRollosPaged(eventoActivo.id, pagina)
  const rollos = rollosPaged?.items ?? []
  const updateTicketRollo = useUpdateTicketRollo()
  const createTicketRollo = useCreateTicketRollo()
  const deleteTicketRollo = useDeleteTicketRollo()

  return (
    <>
      <Card title="🎟️ Ticketeras">
        {rollos.length === 0 ? (
          <p className="text-sm text-gray-300">No hay ticketeras cargadas</p>
        ) : (
          <div className="space-y-3">
            {productos.map((p, idx) => {
              const rollosProducto = rollos.filter((r) => r.productoId === p.id)
              if (rollosProducto.length === 0) return null
              const colorClass = coloresPorProducto[idx % coloresPorProducto.length]
              return (
                <div key={p.id} className={`rounded-lg border border-borde/30 border-l-4 p-3 ${colorClass}`}>
                  <p className="mb-2 text-sm font-semibold text-white">{p.nombre}</p>
                  <div className="space-y-1">
                    {rollosProducto.map((r) => (
                      <div key={r.id} className="flex items-center justify-between rounded-lg border border-borde/20 px-3 py-2 transition-all duration-200 hover:bg-white/2">
                        <div className="flex items-center gap-2 text-xs text-gray-200">
                          <span>{r.numeroInicial} → {r.numeroFinal ?? r.totalTicketera}</span>
                          {r.numeroFinal !== null ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-semibold text-green-400">
                              ✓ Completada
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/15 px-2 py-0.5 text-xs font-semibold text-yellow-400">
                              ● en uso
                            </span>
                          )}
                          <span className="text-gray-300">
                            ({r.ticketsCalculados} tickets · ${r.subtotal.toFixed(2)})
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {r.numeroFinal === null && (
                            <>
                              <button
                                onClick={() => setNuevoRollo({ rollo: r, ultimoNumero: '' })}
                                className="rounded-lg px-2 py-1 text-xs font-semibold text-green-400 transition-all duration-200 hover:bg-green-400/10"
                              >
                                + Nueva
                              </button>
                              <button
                                onClick={() => setEditandoRollo({ rollo: r, numeroInicial: String(r.numeroInicial) })}
                                className="rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-all duration-200 hover:bg-primary/10"
                              >
                                Editar
                              </button>
                              {rollosProducto.some(r2 => r2.id !== r.id && r2.numeroFinal !== null) ? (
                                <button
                                  onClick={() => setDeshaciendoRollo(r)}
                                  className="rounded-lg px-2 py-1 text-xs font-semibold text-orange-400 transition-all duration-200 hover:bg-orange-400/10"
                                >
                                  Deshacer
                                </button>
                              ) : (
                                <button
                                  onClick={() => setEliminandoRollo(r)}
                                  className="rounded-lg px-2 py-1 text-xs font-semibold text-red-400 transition-all duration-200 hover:bg-red-400/10"
                                >
                                  Eliminar
                                </button>
                              )}
                            </>
                          )}
                          {r.numeroFinal !== null && (
                            <button
                              onClick={() => setEliminandoRollo(r)}
                              className="rounded-lg px-2 py-1 text-xs font-semibold text-red-400 transition-all duration-200 hover:bg-red-400/10"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {rollosPaged && (
          <Pagination page={pagina} totalPages={rollosPaged.totalPages} onPageChange={setPagina} />
        )}
      </Card>

      {/* Confirmación eliminar rollo */}
      <Modal
        open={!!eliminandoRollo}
        onOpenChange={() => setEliminandoRollo(null)}
        title="Eliminar ticketera"
      >
        <p className="mb-6 text-sm text-gray-200">
          ¿Eliminar ticketera {eliminandoRollo?.numeroInicial} → {eliminandoRollo?.numeroFinal ?? 'en uso'} de{' '}
          <span className="text-white">{eliminandoRollo?.productoNombre}</span>?
          Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setEliminandoRollo(null)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              if (!eliminandoRollo) return
              try {
                await deleteTicketRollo.mutateAsync({ eventoId: eventoActivo.id, id: eliminandoRollo.id })
                toast.success('Ticketera eliminada')
                setEliminandoRollo(null)
              } catch {
                toast.error('Error al eliminar ticketera')
              }
            }}
          >
            Eliminar
          </Button>
        </div>
      </Modal>

      {/* Modal editar ticketera */}
      <Modal
        open={!!editandoRollo}
        onOpenChange={(o) => { if (!o) setEditandoRollo(null) }}
        title="Editar ticketera"
      >
        {editandoRollo && (
          <form onSubmit={async (e) => {
            e.preventDefault()
            const val = Number(editandoRollo.numeroInicial)
            if (val < 1) {
              setErrorEditar('El número inicial debe ser mayor o igual a 1')
              return
            }
            setErrorEditar('')
            await updateTicketRollo.mutateAsync({
              eventoId: eventoActivo.id,
              id: editandoRollo.rollo.id,
              numeroInicial: val,
            })
            setEditandoRollo(null)
          }}>
            <p className="mb-4 text-sm text-gray-200">
              Editando ticketera de <span className="text-white">{editandoRollo.rollo.productoNombre}</span>
            </p>
            <Input
              label="Número inicial"
              type="number"
              min={1}
              value={editandoRollo.numeroInicial}
              onChange={(e) => setEditandoRollo({ ...editandoRollo, numeroInicial: e.target.value })}
            />
            {errorEditar && (
              <p className="mb-3 text-sm text-red-400">{errorEditar}</p>
            )}
            <div className="mt-4 flex gap-3">
              <Button type="button" variant="secondary" onClick={() => setEditandoRollo(null)}>
                Cancelar
              </Button>
              <Button type="submit" loading={updateTicketRollo.isPending}>
                Guardar
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal nueva ticketera */}
      <Modal
        open={!!nuevoRollo}
        onOpenChange={(o) => { if (!o) setNuevoRollo(null) }}
        title="Completar ticketera y crear nueva"
      >
        {nuevoRollo && (
          <form onSubmit={async (e) => {
            e.preventDefault()
            const ultimo = Number(nuevoRollo.ultimoNumero)
            if (ultimo < nuevoRollo.rollo.numeroInicial) {
              setErrorNuevo(`Debe ser mayor o igual a ${nuevoRollo.rollo.numeroInicial}`)
              return
            }
            setErrorNuevo('')
            try {
              await updateTicketRollo.mutateAsync({
                eventoId: eventoActivo.id,
                id: nuevoRollo.rollo.id,
                numeroFinal: ultimo,
                completada: true,
              })
              await createTicketRollo.mutateAsync({
                eventoId: eventoActivo.id,
                data: {
                  productoId: nuevoRollo.rollo.productoId,
                  numeroInicial: 1,
                },
              })
              toast.success('Ticketera completada y nueva creada')
              setNuevoRollo(null)
            } catch {
              toast.error('Error al completar ticketera')
            }
          }}>
            <p className="mb-4 text-sm text-gray-200">
              Completando ticketera de <span className="text-white">{nuevoRollo.rollo.productoNombre}</span>
            </p>
            <p className="mb-3 text-sm text-gray-300">
              Ticketera actual: {nuevoRollo.rollo.numeroInicial} en adelante
            </p>
            <Input
              label="Último número vendido"
              type="number"
              min={nuevoRollo.rollo.numeroInicial}
              value={nuevoRollo.ultimoNumero}
              onChange={(e) => setNuevoRollo({ ...nuevoRollo, ultimoNumero: e.target.value })}
            />
            {errorNuevo && (
              <p className="mb-3 text-sm text-red-400">{errorNuevo}</p>
            )}
            <div className="mt-4 flex gap-3">
              <Button type="button" variant="secondary" onClick={() => setNuevoRollo(null)}>
                Cancelar
              </Button>
              <Button type="submit" loading={updateTicketRollo.isPending || createTicketRollo.isPending}>
                Completar y crear nueva
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal deshacer */}
      <Modal
        open={!!deshaciendoRollo}
        onOpenChange={(o) => { if (!o) setDeshaciendoRollo(null) }}
        title="Deshacer ticketera"
      >
        <p className="mb-4 text-sm text-gray-200">
          ¿Deshacer? Se eliminará esta ticketera y la completada volverá a estar en uso.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDeshaciendoRollo(null)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              if (!deshaciendoRollo) return
              const completada = rollos.find((r) => r.productoId === deshaciendoRollo.productoId && r.id !== deshaciendoRollo.id && r.numeroFinal !== null)
              try {
                await deleteTicketRollo.mutateAsync({ eventoId: eventoActivo.id, id: deshaciendoRollo.id })
                if (completada) {
                  await updateTicketRollo.mutateAsync({
                    eventoId: eventoActivo.id,
                    id: completada.id,
                    numeroFinal: null,
                    completada: false,
                    limpiarNumeroFinal: true,
                  })
                }
                toast.success('Ticketera deshecha')
                setDeshaciendoRollo(null)
              } catch {
                toast.error('Error al deshacer ticketera')
              }
            }}
            loading={deleteTicketRollo.isPending || updateTicketRollo.isPending}
          >
            Deshacer
          </Button>
        </div>
      </Modal>
    </>
  )
}
