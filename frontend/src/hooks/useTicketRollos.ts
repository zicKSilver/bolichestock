import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'
import { queryKeys } from '../config/queryKeys'
import { toast } from 'sonner'

export function useTicketRollos(eventoId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.ticketRollos.all(eventoId!),
    queryFn: () => api.getTicketRollos(eventoId!),
    enabled: !!eventoId,
  })
}

export function useTicketRollosPaged(eventoId: number | undefined, page: number, pageSize = 20) {
  return useQuery({
    queryKey: queryKeys.ticketRollos.paged(eventoId!, page),
    queryFn: () => api.getTicketRollosPaged(eventoId!, page, pageSize),
    enabled: !!eventoId,
  })
}

export function useCreateTicketRollo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ eventoId, data }: { eventoId: number; data: { productoId: number; numeroInicial: number; totalTicketera?: number } }) =>
      api.createTicketRollo(eventoId, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.ticketRollos.all(vars.eventoId) })
      qc.invalidateQueries({ queryKey: ['ticket-rollos', vars.eventoId, 'paged'] })
      qc.invalidateQueries({ queryKey: queryKeys.eventos })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateTicketRollo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ eventoId, id, numeroInicial, numeroFinal, completada, limpiarNumeroFinal }: { eventoId: number; id: number; numeroInicial?: number; numeroFinal?: number | null; completada?: boolean; limpiarNumeroFinal?: boolean }) =>
      api.updateTicketRollo(eventoId, id, { numeroInicial, numeroFinal, completada, limpiarNumeroFinal }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.ticketRollos.all(vars.eventoId) })
      qc.invalidateQueries({ queryKey: queryKeys.eventos })
    },
  })
}

export function useDeleteTicketRollo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ eventoId, id }: { eventoId: number; id: number }) =>
      api.deleteTicketRollo(eventoId, id),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.ticketRollos.all(vars.eventoId) })
      qc.invalidateQueries({ queryKey: queryKeys.eventos })
    },
  })
}
