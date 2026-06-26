import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthContext } from '../authContext'
import { AuthProvider } from '../AuthProvider'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

function TestConsumer() {
  return (
    <AuthContext.Consumer>
      {(ctx) => (
        <div>
          <span data-testid="token">{ctx?.token ?? 'null'}</span>
          <span data-testid="user">{ctx?.user ?? 'null'}</span>
          <span data-testid="auth">{String(ctx?.isAuthenticated)}</span>
          <button data-testid="btn-login" onClick={() => ctx?.login('tok123', 'admin', false)}>
            Login
          </button>
          <button data-testid="btn-logout" onClick={() => ctx?.logout()}>
            Logout
          </button>
        </div>
      )}
    </AuthContext.Consumer>
  )
}

describe('AuthProvider', () => {
  it('starts with null token and unauthenticated', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    expect(screen.getByTestId('token')).toHaveTextContent('null')
    expect(screen.getByTestId('user')).toHaveTextContent('null')
    expect(screen.getByTestId('auth')).toHaveTextContent('false')
  })

  it('login updates token, user, and authenticated state', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await userEvent.click(screen.getByTestId('btn-login'))

    expect(screen.getByTestId('token')).toHaveTextContent('tok123')
    expect(screen.getByTestId('user')).toHaveTextContent('admin')
    expect(screen.getByTestId('auth')).toHaveTextContent('true')
    expect(localStorage.getItem('token')).toBe('tok123')
    expect(localStorage.getItem('user')).toBe('admin')
  })

  it('logout clears state and navigates to /login', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await userEvent.click(screen.getByTestId('btn-login'))
    await userEvent.click(screen.getByTestId('btn-logout'))

    expect(screen.getByTestId('token')).toHaveTextContent('null')
    expect(screen.getByTestId('user')).toHaveTextContent('null')
    expect(screen.getByTestId('auth')).toHaveTextContent('false')
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })
})
