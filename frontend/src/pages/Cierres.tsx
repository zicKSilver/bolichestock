import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useDeleteCierre } from '../hooks/useEventos'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { SkeletonCard } from '../components/ui/Skeleton'
import { formatDateLocal } from '../utils/dates'
import { toast } from 'sonner'
import type { CierreListado } from '../types/evento'
import type { PagedResult } from '../types/common'

export default function Cierres() {
  const navigate = useNavigate()
  const [allItems, setAllItems] = useState<CierreListado[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState('')
  const [eliminando, setEliminando] = useState<CierreListado | null>(null)
  const loadingRef = useRef(false)
  const deleteCierre = useDeleteCierre()

  useEffect(() => {
    let cancelled = false
    loadingRef.current = true

    api.getCierresPaged(page)
      .then((res: PagedResult<CierreListado>) => {
        if (cancelled) return
        setAllItems((prev) => page === 1 ? res.items : [...prev, ...res.items])
        setTotalPages(res.totalPages)
        setTotalCount(res.totalCount)
      })
      .catch(() => {
        if (!cancelled) setError('Error al cargar cierres')
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
          setInitialLoading(false)
          loadingRef.current = false
        }
      })

    return () => { cancelled = true }
  }, [page])

  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && page < totalPages && !loadingRef.current) {
          loadingRef.current = true
          setIsLoading(true)
          setPage((prev) => prev + 1)
        }
      })

      if (node) observerRef.current.observe(node)
    },
    [isLoading, page, totalPages]
  )

  const hasMore = page < totalPages

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-white drop-shadow-[0_0_6px_rgba(232,121,249,0.15)]">
        Cierres de caja
      </h1>

      {initialLoading ? (
        <SkeletonCard />
      ) : error ? (
        <Card title="Error">
          <p className="text-sm text-red-400">{error}</p>
        </Card>
      ) : allItems.length === 0 ? (
        <Card title="Sin cierres">
          <p className="text-gray-200">Todavía no hay ningún cierre de caja registrado.</p>
        </Card>
      ) : (
        <Card title={`Cierres anteriores (${totalCount})`} className="bg-secondary/5">
          <div className="space-y-2">
              {allItems.map((c, index) => {
              const isLast = index === allItems.length - 1
              return (
                <div
                  key={c.id}
                  ref={isLast ? lastItemRef : null}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-borde/50 p-3 transition-all duration-200 hover:border-primary/30 hover:bg-white/2 hover:shadow-[0_0_8px_rgba(232,121,249,0.08)]"
                  onClick={() => navigate(`/cierre/${c.eventoId}`)}
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {formatDateLocal(c.fechaEvento)}
                    </p>
                    <p className="text-xs text-gray-300">
                      Cerrado {new Date(c.fechaHoraCierre).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-200">
                        ${c.totalVendido.toFixed(2)}
                      </p>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                        c.diferencia >= 0 ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                      }`}>
                        {c.diferencia >= 0 ? '+' : ''}${c.diferencia.toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setEliminando(c) }}
                      className="rounded-lg border border-red-500/30 px-2 py-1 text-xs text-red-400 transition-all duration-200 hover:bg-red-500/10"
                      title="Eliminar cierre"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {isLoading && (
            <div className="mt-3 flex justify-center">
              <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}

          {!hasMore && allItems.length > 0 && (
            <p className="mt-3 text-center text-xs text-gray-500">Todos los cierres cargados</p>
          )}
        </Card>
      )}

      <Modal
        open={!!eliminando}
        onOpenChange={() => setEliminando(null)}
        title="Eliminar cierre de caja"
      >
        <p className="mb-2 text-sm text-gray-200">
          Vas a eliminar el cierre del <span className="text-white">{eliminando ? formatDateLocal(eliminando.fechaEvento) : ''}</span>.
        </p>
        <p className="mb-6 text-sm text-yellow-400">
          El evento se reabrirá y podrás cerrarlo de nuevo si es necesario.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setEliminando(null)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            loading={deleteCierre.isPending}
            onClick={async () => {
              if (!eliminando) return
              try {
                await deleteCierre.mutateAsync(eliminando.eventoId)
                setAllItems((prev) => prev.filter((c) => c.id !== eliminando.id))
                setTotalCount((prev) => prev - 1)
                toast.success('Cierre eliminado')
              } catch {
                toast.error('Error al eliminar el cierre')
              }
              setEliminando(null)
            }}
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
