import { useUsuarios, useSetAdmin } from '../hooks/useUsuarios'
import Card from '../components/ui/Card'
import { SkeletonCard } from '../components/ui/Skeleton'
import { toast } from 'sonner'
import { useAuth } from '../hooks/useAuth'

export default function Usuarios() {
  const { data: usuarios, isLoading } = useUsuarios()
  const setAdmin = useSetAdmin()
  const { user } = useAuth()

  async function toggleAdmin(id: number, nombre: string, current: boolean) {
    setAdmin.mutate(
      { id, isAdmin: !current },
      {
        onSuccess: () => toast.success(`${nombre} ${current ? 'ya no es' : 'ahora es'} admin`),
        onError: () => toast.error('Error al cambiar permisos'),
      },
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <h1 className="text-2xl font-bold text-white drop-shadow-[0_0_6px_rgba(232,121,249,0.15)]">
        Usuarios
      </h1>

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
                className="flex items-center justify-between rounded-lg border border-borde/50 p-3 transition-all duration-200 hover:border-primary/30 hover:bg-white/2"
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
                {u.nombreUsuario !== user && (
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
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
