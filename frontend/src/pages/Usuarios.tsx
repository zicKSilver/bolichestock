import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useUsuarios, useSetAdmin, useCrearUsuario, useEliminarUsuario } from '../hooks/useUsuarios'
import Card from '../components/ui/Card'
import { SkeletonCard } from '../components/ui/Skeleton'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { toast } from 'sonner'
import { useAuth } from '../hooks/useAuth'

export default function Usuarios() {
  const { data: usuarios, isLoading } = useUsuarios()
  const setAdmin = useSetAdmin()
  const crearUsuario = useCrearUsuario()
  const eliminarUsuario = useEliminarUsuario()
  const { user, isAdmin } = useAuth()

  const [crearOpen, setCrearOpen] = useState(false)
  const [nuevoUsuario, setNuevoUsuario] = useState('')
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [crearError, setCrearError] = useState('')

  if (!isAdmin) return <Navigate to="/dashboard" replace />

  function toggleAdmin(id: number, nombre: string, current: boolean) {
    setAdmin.mutate(
      { id, isAdmin: !current },
      {
        onSuccess: () => toast.success(`${nombre} ${current ? 'ya no es' : 'ahora es'} admin`),
        onError: () => toast.error('Error al cambiar permisos'),
      },
    )
  }

  function handleCrear(e: FormEvent) {
    e.preventDefault()
    setCrearError('')
    crearUsuario.mutate(
      { nombreUsuario: nuevoUsuario, password: nuevaPassword },
      {
        onSuccess: () => {
          toast.success(`Usuario "${nuevoUsuario}" creado`)
          setCrearOpen(false)
          setNuevoUsuario('')
          setNuevaPassword('')
        },
        onError: (err) => setCrearError(err.message),
      },
    )
  }

  function handleEliminar(id: number, nombre: string) {
    if (!confirm(`¿Eliminar al usuario "${nombre}"?`)) return
    eliminarUsuario.mutate(id, {
      onSuccess: () => toast.success(`Usuario "${nombre}" eliminado`),
      onError: () => toast.error('Error al eliminar usuario'),
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white drop-shadow-[0_0_6px_rgba(232,121,249,0.15)]">
          Usuarios
        </h1>
        <Button variant="ghost" onClick={() => setCrearOpen(true)}>
          + Crear usuario
        </Button>
      </div>

      {isLoading ? (
        <SkeletonCard />
      ) : !usuarios || usuarios.length === 0 ? (
        <Card title="Sin usuarios">
          <p className="text-sm text-gray-200">No hay usuarios registrados.</p>
        </Card>
      ) : (
        <Card title={`Usuarios (${usuarios.length})`} className="bg-secondary/5">
          <div className="space-y-2">
            {usuarios.map((u) => (
              <div
                key={u.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-borde/50 p-3 transition-all duration-200 hover:border-primary/30 hover:bg-white/2"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-white">{u.nombreUsuario}</span>
                  {u.isAdmin && (
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                      Admin
                    </span>
                  )}
                  {u.nombreUsuario === user && (
                    <span className="text-xs text-gray-500">(vos)</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {u.nombreUsuario !== user && (
                    <>
                      <button
                        onClick={() => toggleAdmin(u.id, u.nombreUsuario, u.isAdmin)}
                        disabled={setAdmin.isPending}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                          u.isAdmin
                            ? 'border border-red-500/30 text-red-400 hover:bg-red-500/10'
                            : 'bg-primary text-black hover:shadow-lg hover:shadow-primary/40'
                        } disabled:opacity-50`}
                      >
                        {setAdmin.isPending ? '...' : u.isAdmin ? 'Quitar admin' : 'Hacer admin'}
                      </button>
                      <button
                        onClick={() => handleEliminar(u.id, u.nombreUsuario)}
                        disabled={eliminarUsuario.isPending}
                        className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-400 transition-all duration-200 hover:bg-red-500/10 disabled:opacity-50"
                      >
                        {eliminarUsuario.isPending ? '...' : 'Eliminar'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal open={crearOpen} onOpenChange={setCrearOpen} title="Crear usuario">
        <form onSubmit={handleCrear} className="space-y-4">
          <Input
            label="Nombre de usuario"
            value={nuevoUsuario}
            onChange={(e) => setNuevoUsuario(e.target.value)}
            autoFocus
          />
          <Input
            label="Contraseña"
            type="password"
            value={nuevaPassword}
            onChange={(e) => setNuevaPassword(e.target.value)}
          />
          {crearError && <p className="text-sm text-red-400">{crearError}</p>}
          <Button
            type="submit"
            loading={crearUsuario.isPending}
            disabled={!nuevoUsuario || !nuevaPassword}
            className="w-full"
          >
            Crear
          </Button>
        </form>
      </Modal>
    </div>
  )
}
