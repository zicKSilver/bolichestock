import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'
import type { ProductoRequest } from '../types/producto'
import { queryKeys } from '../config/queryKeys'

export function useProductos() {
  return useQuery({
    queryKey: queryKeys.productos,
    queryFn: api.getProductos,
  })
}

export function useCreateProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ProductoRequest) => api.createProducto(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.productos }),
  })
}

export function useUpdateProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoRequest }) => api.updateProducto(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.productos }),
  })
}

export function useDeleteProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.deleteProducto(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.productos }),
  })
}
