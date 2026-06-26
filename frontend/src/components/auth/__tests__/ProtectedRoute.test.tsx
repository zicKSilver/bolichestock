import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

let mockIsAuthenticated = false

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: mockIsAuthenticated }),
}))

beforeEach(() => {
  mockIsAuthenticated = false
})

describe('ProtectedRoute', () => {
  it('redirects to /login when not authenticated', async () => {
    mockIsAuthenticated = false
    const { default: ProtectedRoute } = await import('../ProtectedRoute')
    const { container } = render(
      <MemoryRouter>
        <ProtectedRoute>
          <p>secreto</p>
        </ProtectedRoute>
      </MemoryRouter>
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders children when authenticated', async () => {
    mockIsAuthenticated = true
    const { default: ProtectedRoute } = await import('../ProtectedRoute')
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <p>secreto</p>
        </ProtectedRoute>
      </MemoryRouter>
    )
    expect(screen.getByText('secreto')).toBeInTheDocument()
  })
})
