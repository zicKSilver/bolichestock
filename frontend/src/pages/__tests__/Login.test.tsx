import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockNavigate = vi.fn()
let mockLogin = vi.fn()
let mockApiLogin = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ login: mockLogin }),
}))

vi.mock('../../services/api', () => ({
  api: {
    login: (...args: unknown[]) => mockApiLogin(...args),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockLogin = vi.fn()
  mockApiLogin = vi.fn()
})

describe('Login', () => {
  it('renders title and form', async () => {
    const { default: Login } = await import('../Login')
    render(<Login />)
    expect(screen.getByText('CACHENGUE CLUB')).toBeInTheDocument()
    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument()
    expect(screen.getByText('Usuario')).toBeInTheDocument()
    expect(screen.getByText('Contraseña')).toBeInTheDocument()
  })

  it('disables button when fields are empty', async () => {
    const { default: Login } = await import('../Login')
    render(<Login />)
    const btn = screen.getByRole('button', { name: /Ingresar/ })
    expect(btn).toBeDisabled()
  })

  function getInputs() {
    const form = document.querySelector('form')!
    const inputs = form.querySelectorAll('input')
    return { usuarioInput: inputs[0], passwordInput: inputs[1] }
  }

  it('enables button when both fields have values', async () => {
    const { default: Login } = await import('../Login')
    render(<Login />)
    const { usuarioInput, passwordInput } = getInputs()
    await userEvent.type(usuarioInput, 'admin')
    await userEvent.type(passwordInput, '1234')
    const btn = screen.getByRole('button', { name: /Ingresar/ })
    expect(btn).not.toBeDisabled()
  })

  it('calls api.login and navigates on success', async () => {
    mockApiLogin.mockResolvedValue({ token: 'abc', nombreUsuario: 'Admin', isAdmin: false })
    const { default: Login } = await import('../Login')
    render(<Login />)
    const { usuarioInput, passwordInput } = getInputs()
    await userEvent.type(usuarioInput, 'admin')
    await userEvent.type(passwordInput, '1234')
    await userEvent.click(screen.getByRole('button', { name: /Ingresar/ }))
    expect(mockApiLogin).toHaveBeenCalledWith('admin', '1234')
    expect(mockLogin).toHaveBeenCalledWith('abc', 'Admin', false)
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
  })

  it('shows error message on failed login', async () => {
    mockApiLogin.mockRejectedValue(new Error('Credenciales inválidas'))
    const { default: Login } = await import('../Login')
    render(<Login />)
    const { usuarioInput, passwordInput } = getInputs()
    await userEvent.type(usuarioInput, 'admin')
    await userEvent.type(passwordInput, 'wrong')
    await userEvent.click(screen.getByRole('button', { name: /Ingresar/ }))
    expect(await screen.findByText('Usuario o contraseña incorrectos')).toBeInTheDocument()
  })

  it('shows connection error for TypeError', async () => {
    mockApiLogin.mockRejectedValue(new TypeError('Failed to fetch'))
    const { default: Login } = await import('../Login')
    render(<Login />)
    const { usuarioInput, passwordInput } = getInputs()
    await userEvent.type(usuarioInput, 'admin')
    await userEvent.type(passwordInput, '1234')
    await userEvent.click(screen.getByRole('button', { name: /Ingresar/ }))
    expect(await screen.findByText('Error de conexión con el servidor')).toBeInTheDocument()
  })
})
