import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

let mockPathname = '/dashboard'
const mockLogout = vi.fn()

vi.mock('react-router-dom', () => ({
  Link: ({ children, to, className }: { children: React.ReactNode; to: string; className?: string }) => (
    <a href={to} className={className}>{children}</a>
  ),
  useLocation: () => ({ pathname: mockPathname }),
}))

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ user: 'admin', logout: mockLogout }),
}))

beforeEach(() => {
  mockPathname = '/dashboard'
  mockLogout.mockClear()
})

describe('Navbar', () => {
  it('renders all navigation links', async () => {
    const { default: Navbar } = await import('../Navbar')
    render(<Navbar />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Reportes')).toBeInTheDocument()
    expect(screen.getByText('Cierres')).toBeInTheDocument()
    expect(screen.getByText('Productos')).toBeInTheDocument()
    expect(screen.getByText('Salir')).toBeInTheDocument()
  })

  it('shows the current user name', async () => {
    const { default: Navbar } = await import('../Navbar')
    render(<Navbar />)
    expect(screen.getByText('admin')).toBeInTheDocument()
  })

  it('highlights the active link with bg-primary class', async () => {
    mockPathname = '/reportes'
    const { default: Navbar } = await import('../Navbar')
    render(<Navbar />)
    const reportesLink = screen.getByText('Reportes').closest('a')
    expect(reportesLink?.className).toContain('bg-primary')
  })

  it('calls logout when Salir is clicked', async () => {
    const { default: Navbar } = await import('../Navbar')
    render(<Navbar />)
    await userEvent.click(screen.getByText('Salir'))
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })
})
