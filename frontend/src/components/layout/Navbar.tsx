import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const { pathname } = useLocation()

  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/reportes', label: 'Reportes' },
    { to: '/cierres', label: 'Cierres' },
    { to: '/productos', label: 'Productos' },
    ...(isAdmin ? [{ to: '/usuarios', label: 'Usuarios' }] : []),
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-borde/20 bg-neutral-900/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/dashboard" className="text-xl font-bold tracking-wider text-primary drop-shadow-[0_0_8px_rgba(232,121,249,0.3)]">
          CACHENGUE CLUB
        </Link>

        <div className="flex items-center gap-1 text-sm">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.to)
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-lg px-3 py-1.5 font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/15 text-primary shadow-[0_0_8px_rgba(232,121,249,0.15)]'
                    : 'text-secondary/80 hover:bg-white/5 hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            )
          })}

          <span className="ml-2 rounded-lg border border-secondary/30 px-3 py-1.5 text-sm text-secondary">
            {user}
          </span>
          <button
            onClick={logout}
            className="rounded-lg border border-red-500/30 px-3 py-1.5 text-sm text-red-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-300"
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  )
}
