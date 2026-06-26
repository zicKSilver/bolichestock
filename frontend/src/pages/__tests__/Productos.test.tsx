import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

let mockProductos: { data: { id: number; nombre: string; precio: number }[]; isLoading: boolean } = { data: [], isLoading: false }
const mockCreateProducto = { mutateAsync: vi.fn(), isPending: false }
const mockUpdateProducto = { mutateAsync: vi.fn(), isPending: false }
const mockDeleteProducto = { mutateAsync: vi.fn(), isPending: false }

vi.mock('../../hooks/useProductos', () => ({
  useProductos: () => mockProductos,
  useCreateProducto: () => mockCreateProducto,
  useUpdateProducto: () => mockUpdateProducto,
  useDeleteProducto: () => mockDeleteProducto,
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockProductos = { data: [], isLoading: false }
})

function mockProducts(count = 3) {
  mockProductos = {
    data: Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      nombre: `Producto ${i + 1}`,
      precio: (i + 1) * 100,
    })),
    isLoading: false,
  }
}

describe('Productos', () => {
  it('shows loading skeleton when loading', async () => {
    mockProductos = { data: [], isLoading: true }
    const { default: Productos } = await import('../Productos')
    const { container } = render(<Productos />)
    const skeletons = container.querySelectorAll('[class*="shimmer"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows empty state when no products', async () => {
    const { default: Productos } = await import('../Productos')
    render(<Productos />)
    expect(screen.getByText('No hay productos. Agregá el primero.')).toBeInTheDocument()
  })

  it('renders product list', async () => {
    mockProducts(3)
    const { default: Productos } = await import('../Productos')
    render(<Productos />)
    expect(screen.getByText('Producto 1')).toBeInTheDocument()
    expect(screen.getByText('Producto 2')).toBeInTheDocument()
    expect(screen.getByText('Producto 3')).toBeInTheDocument()
  })

  it('filters products by search', async () => {
    mockProducts(5)
    const { default: Productos } = await import('../Productos')
    render(<Productos />)
    const searchInput = screen.getByPlaceholderText('Buscar producto por nombre...')
    await userEvent.type(searchInput, 'Producto 3')
    expect(screen.getByText('Producto 3')).toBeInTheDocument()
    expect(screen.queryByText('Producto 1')).not.toBeInTheDocument()
  })

  it('shows no results message when search matches nothing', async () => {
    mockProducts(3)
    const { default: Productos } = await import('../Productos')
    render(<Productos />)
    const searchInput = screen.getByPlaceholderText('Buscar producto por nombre...')
    await userEvent.type(searchInput, 'xyz')
    expect(screen.getByText('No se encontraron productos')).toBeInTheDocument()
  })

  it('opens modal to create product', async () => {
    mockProducts(0)
    const { default: Productos } = await import('../Productos')
    render(<Productos />)
    await userEvent.click(screen.getByText('+ Agregar'))
    expect(await screen.findByText('Agregar producto')).toBeInTheDocument()
  })

  it('opens modal to edit product', async () => {
    mockProducts(2)
    const { default: Productos } = await import('../Productos')
    render(<Productos />)
    const editBtns = screen.getAllByText('Editar')
    await userEvent.click(editBtns[0])
    expect(await screen.findByText('Editar producto')).toBeInTheDocument()
  })

  it('opens delete confirmation modal', async () => {
    mockProducts(2)
    const { default: Productos } = await import('../Productos')
    render(<Productos />)
    await userEvent.click(screen.getAllByText('Eliminar')[0])
    expect(await screen.findByText(/¿Eliminar/)).toBeInTheDocument()
  })
})
