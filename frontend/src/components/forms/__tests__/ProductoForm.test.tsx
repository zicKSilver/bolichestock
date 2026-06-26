import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockOnSave = vi.fn()
const mockOnCancel = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ProductoForm', () => {
  it('renders fields and save button in create mode', async () => {
    const { default: ProductoForm } = await import('../ProductoForm')
    render(<ProductoForm onSave={mockOnSave} onCancel={mockOnCancel} />)
    expect(screen.getByPlaceholderText('Nombre del producto')).toBeInTheDocument()
    expect(screen.getByText('Guardar')).toBeInTheDocument()
  })

  it('shows Actualizar button when editing', async () => {
    const { default: ProductoForm } = await import('../ProductoForm')
    render(
      <ProductoForm
        producto={{ id: 1, nombre: 'Cerveza', precio: 5 }}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    )
    expect(screen.getByText('Actualizar')).toBeInTheDocument()
    const input = screen.getByPlaceholderText('Nombre del producto') as HTMLInputElement
    expect(input.value).toBe('Cerveza')
  })

  it('shows error when nombre is empty', async () => {
    const { default: ProductoForm } = await import('../ProductoForm')
    render(<ProductoForm onSave={mockOnSave} onCancel={mockOnCancel} />)
    await userEvent.click(screen.getByText('Guardar'))
    expect(screen.getByText('El nombre es requerido')).toBeInTheDocument()
    expect(mockOnSave).not.toHaveBeenCalled()
  })

  it('shows error when precio is 0', async () => {
    const { default: ProductoForm } = await import('../ProductoForm')
    render(<ProductoForm onSave={mockOnSave} onCancel={mockOnCancel} />)
    await userEvent.type(screen.getByPlaceholderText('Nombre del producto'), 'Cerveza')
    await userEvent.click(screen.getByText('Guardar'))
    expect(screen.getByText('El precio debe ser mayor a 0')).toBeInTheDocument()
    expect(mockOnSave).not.toHaveBeenCalled()
  })

  it('calls onSave with correct data when valid', async () => {
    mockOnSave.mockResolvedValue(undefined)
    const { default: ProductoForm } = await import('../ProductoForm')
    render(<ProductoForm onSave={mockOnSave} onCancel={mockOnCancel} />)
    await userEvent.type(screen.getByPlaceholderText('Nombre del producto'), 'FICHAS X 1')
    await userEvent.type(screen.getByPlaceholderText('0.00'), '20')
    await userEvent.click(screen.getByText('Guardar'))
    expect(mockOnSave).toHaveBeenCalledWith({ nombre: 'FICHAS X 1', precio: 20 })
  })
})
