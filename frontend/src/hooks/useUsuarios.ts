import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'

export interface Usuario {
  id: number
  nombreUsuario: string
  isAdmin: boolean
}

export function useUsuarios() {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: () => api.getUsuarios(),
  })
}

export function useSetAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isAdmin }: { id: number; isAdmin: boolean }) => api.setAdmin(id, isAdmin),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['usuarios'] }),
  })
}

export function useCrearUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ nombreUsuario, password }: { nombreUsuario: string; password: string }) =>
      api.createUsuario(nombreUsuario, password),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['usuarios'] }),
  })
}

export function useEliminarUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.deleteUsuario(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['usuarios'] }),
  })
}
