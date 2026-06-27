import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/reportes', label: 'Reportes' },
    { to: '/cierres', label: 'Cierres' },
    { to: '/productos', label: 'Productos' },
    ...(isAdmin ? [{ to: '/usuarios', label: 'Usuarios' }] : []),
  ]

  function handleLinkClick() {
    setMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-borde/20 bg-neutral-900/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="text-xl font-bold tracking-wider text-primary drop-shadow-[0_0_8px_rgba(232,121,249,0.3)]">
          CACHENGUE CLUB
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 text-sm sm:flex">
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

        {/* Hamburger button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 text-gray-300 transition hover:bg-white/10 hover:text-white sm:hidden"
          aria-label="Menú"
        >
          <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-borde/20 bg-neutral-900/95 px-4 pb-4 pt-2 sm:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => {
              const isActive = pathname.startsWith(link.to)
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={handleLinkClick}
                  className={`rounded-lg px-3 py-2 font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/15 text-primary'
                      : 'text-secondary/80 hover:bg-white/5 hover:text-primary'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
            <div className="mt-2 flex items-center gap-2 border-t border-borde/20 pt-2">
              <span className="rounded-lg border border-secondary/30 px-3 py-1.5 text-sm text-secondary">
                {user}
              </span>
              <button
                onClick={() => { logout(); setMenuOpen(false) }}
                className="rounded-lg border border-red-500/30 px-3 py-1.5 text-sm text-red-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-300"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
