import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { queryKeys } from '../config/queryKeys'

export function useReporte(desde: string, hasta: string, productoId?: number) {
  return useQuery({
    queryKey: queryKeys.reporte(desde, hasta, productoId),
    queryFn: () => api.getReporte(desde, hasta, productoId),
  })
}
