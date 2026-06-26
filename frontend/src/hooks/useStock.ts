import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'
import { queryKeys } from '../config/queryKeys'
import type { StockItem } from '../types/evento'

export function useStock(eventoId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.stocks(eventoId!),
    queryFn: () => api.getStocks(eventoId!),
    enabled: !!eventoId,
  })
}

export function useUpdateStock(eventoId: number | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (items: StockItem[]) => api.updateStocks(eventoId!, items),
    onMutate: async (items) => {
      await qc.cancelQueries({ queryKey: queryKeys.stocks(eventoId!) })
      const previous = qc.getQueryData<StockItem[]>(queryKeys.stocks(eventoId!))
      qc.setQueryData(queryKeys.stocks(eventoId!), items)
      return { previous }
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.stocks(eventoId!), context.previous)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.stocks(eventoId!) })
    },
  })
}
