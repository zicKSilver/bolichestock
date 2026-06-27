import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { useProductos, useCreateProducto, useUpdateProducto, useDeleteProducto } from '../hooks/useProductos'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Pagination from '../components/ui/Pagination'
import { SkeletonCard } from '../components/ui/Skeleton'
import ProductoForm from '../components/forms/ProductoForm'
import type { ProductoRequest } from '../types/producto'

const PAGE_SIZE = 10

export default function Productos() {
  const { data: productos = [], isLoading } = useProductos()
  const createProducto = useCreateProducto()
  const updateProducto = useUpdateProducto()
  const deleteProducto = useDeleteProducto()
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<number | null>(null)
  const [eliminando, setEliminando] = useState<number | null>(null)

  const productosFiltrados = useMemo(() =>
    productos.filter((p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    ), [productos, busqueda]
  )

  const totalPaginas = Math.max(1, Math.ceil(productosFiltrados.length / PAGE_SIZE))
  const paginaSegura = Math.min(pagina, totalPaginas)
  const productosPagina = productosFiltrados.slice((paginaSegura - 1) * PAGE_SIZE, paginaSegura * PAGE_SIZE)

  function handleBusqueda(value: string) {
    setBusqueda(value)
    setPagina(1)
  }

  async function handleSave(data: ProductoRequest) {
    try {
      if (editando) {
        await updateProducto.mutateAsync({ id: editando, data })
        toast.success('Producto actualizado')
      } else {
        await createProducto.mutateAsync(data)
        toast.success('Producto creado')
      }
      setModalOpen(false)
      setEditando(null)
    } catch {
      toast.error('Error al guardar')
    }
  }

  async function handleDelete() {
    if (!eliminando) return
    try {
      await deleteProducto.mutateAsync(eliminando)
      toast.success('Producto eliminado')
      setEliminando(null)
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const productoEditando = editando ? productos.find((p) => p.id === editando) : null

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white drop-shadow-[0_0_6px_rgba(232,121,249,0.15)]">
          Productos
        </h1>
        <Button onClick={() => { setEditando(null); setModalOpen(true) }}>
          + Agregar
        </Button>
      </div>

      <Card>
        <div className="relative mb-4">
          <svg className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            placeholder="Buscar producto por nombre..."
            value={busqueda}
            onChange={(e) => handleBusqueda(e.target.value)}
            className="w-full rounded-lg border border-borde/50 bg-fondo py-2 pl-9 pr-4 text-white placeholder-gray-500 outline-none transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_2px_rgba(232,121,249,0.25)]"
          />
        </div>

        {isLoading ? (
          <SkeletonCard />
        ) : productosFiltrados.length === 0 ? (
          <p className="py-8 text-center text-gray-300">
            {busqueda ? 'No se encontraron productos' : 'No hay productos. Agregá el primero.'}
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-borde/30 text-gray-300">
                    <th className="hidden pb-2 pr-2 md:table-cell">ID</th>
                    <th className="pb-2 pr-2">Nombre</th>
                    <th className="pb-2 pr-2 text-right">Precio</th>
                    <th className="pb-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productosPagina.map((p, i) => (
                    <tr key={p.id} className={`border-b border-borde/20 transition-all duration-200 hover:bg-white/2 ${i % 2 === 1 ? 'bg-white/1.5' : ''}`}>
                      <td className="hidden py-2 pr-2 text-gray-200 md:table-cell">{p.id}</td>
                      <td className="py-2 pr-2 text-white">{p.nombre}</td>
                      <td className="py-2 pr-2 text-right text-gray-200">${p.precio.toFixed(2)}</td>
                      <td className="py-2 text-right">
                        <Button
                          variant="ghost"
                          onClick={() => { setEditando(p.id); setModalOpen(true) }}
                          className="mr-1 px-2! py-1! text-xs"
                        >
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => setEliminando(p.id)}
                          className="px-2! py-1! text-xs"
                        >
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={paginaSegura} totalPages={totalPaginas} onPageChange={setPagina} />
          </>
        )}
      </Card>

      <Modal open={modalOpen} onOpenChange={(open) => { setModalOpen(open); if (!open) setEditando(null) }} title={editando ? 'Editar producto' : 'Agregar producto'}>
        <ProductoForm
          key={editando ?? 'nuevo'}
          producto={productoEditando ?? null}
          onSave={handleSave}
          onCancel={() => { setModalOpen(false); setEditando(null) }}
        />
      </Modal>

      <Modal
        open={!!eliminando}
        onOpenChange={() => setEliminando(null)}
        title="Eliminar producto"
      >
        <p className="mb-6 text-sm text-gray-200">
          ¿Eliminar "{productos.find((p) => p.id === eliminando)?.nombre}"? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setEliminando(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
