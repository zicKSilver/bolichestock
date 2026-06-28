import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'
import { queryKeys } from '../config/queryKeys'

export function useEventos() {
  return useQuery({
    queryKey: queryKeys.eventos,
    queryFn: api.getEventos,
  })
}

export function useAbrirEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (fecha: string) => api.abrirEvento(fecha),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.eventos })
    },
  })
}

export function useCerrarEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, efectivoEnCaja, descuentoManual = 0 }: { id: number; efectivoEnCaja: number; descuentoManual?: number }) =>
      api.cerrarEvento(id, efectivoEnCaja, descuentoManual),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.eventos })
      qc.invalidateQueries({ queryKey: ['cierres'] })
    },
  })
}

export function useDesactivarEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.desactivarEvento(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.eventos })
    },
  })
}

export function useCierresPaged(page: number, pageSize = 20) {
  return useQuery({
    queryKey: queryKeys.cierres(page),
    queryFn: () => api.getCierresPaged(page, pageSize),
  })
}

export function useDeleteCierre() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (eventoId: number) => api.deleteCierre(eventoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.eventos })
      qc.invalidateQueries({ queryKey: ['cierres'] })
    },
  })
}
