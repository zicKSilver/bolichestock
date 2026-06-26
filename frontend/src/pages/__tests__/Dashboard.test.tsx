import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

let mockEventos: { data: unknown[]; isLoading: boolean } = { data: [], isLoading: false }
let mockAbrirEvento = { mutate: vi.fn(), isPending: false }
let mockDesactivarEvento = { mutate: vi.fn(), isPending: false }
let mockReporte = { data: { items: [], totalNeto: 0, descuentoManual: 0 } }
let mockProductos: { data: unknown[] } = { data: [] }
let mockTicketRollos: { data: unknown[] } = { data: [] }
let mockCreateTicketRollo = { mutateAsync: vi.fn(), isPending: false }
let mockTicketRollosPaged = { data: { items: [], totalCount: 0, page: 1, pageSize: 20 } }
let mockStocks: { productoId: number; productoNombre: string; stock: number; consumo: number; sinStockNecesario: boolean }[] = []
let mockUpdateStockMutate = vi.fn()

vi.mock('../../hooks/useStock', () => ({
  useStock: () => ({ data: mockStocks }),
  useUpdateStock: () => ({ mutate: mockUpdateStockMutate, isPending: false }),
}))
vi.mock('../../hooks/useEventos', () => ({
  useEventos: () => mockEventos,
  useAbrirEvento: () => mockAbrirEvento,
  useDesactivarEvento: () => mockDesactivarEvento,
}))

vi.mock('../../hooks/useReporte', () => ({
  useReporte: () => mockReporte,
}))

vi.mock('../../hooks/useProductos', () => ({
  useProductos: () => mockProductos,
}))

vi.mock('../../hooks/useTicketRollos', () => ({
  useTicketRollos: () => mockTicketRollos,
  useTicketRollosPaged: () => mockTicketRollosPaged,
  useCreateTicketRollo: () => mockCreateTicketRollo,
  useUpdateTicketRollo: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteTicketRollo: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockEventos = { data: [], isLoading: false }
  mockAbrirEvento = { mutate: vi.fn(), isPending: false }
  mockDesactivarEvento = { mutate: vi.fn(), isPending: false }
  mockReporte = { data: { items: [], totalNeto: 0, descuentoManual: 0 } }
  mockProductos = { data: [] }
  mockTicketRollos = { data: [] }
  mockCreateTicketRollo = { mutateAsync: vi.fn(), isPending: false }
  mockTicketRollosPaged = { data: { items: [], totalCount: 0, page: 1, pageSize: 20 } }
  mockStocks = []
  mockUpdateStockMutate = vi.fn()
})

describe('Dashboard', () => {
  it('shows loading skeleton when loading', async () => {
    mockEventos = { data: [], isLoading: true }

    const { default: Dashboard } = await import('../Dashboard')
    render(<Dashboard />)

    const skeletons = document.querySelectorAll('[class*="shimmer"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows crear evento card when no active evento', async () => {
    const { default: Dashboard } = await import('../Dashboard')
    render(<Dashboard />)

    expect(screen.getByText('📅 No hay evento activo')).toBeInTheDocument()
    expect(screen.getByText('Abrir')).toBeInTheDocument()
  })

  it('shows stock and ticketeras when evento activo exists', async () => {
    mockEventos = {
      data: [{ id: 1, fecha: '2026-06-22', estado: 'Abierto', totalVendido: 0, totalTickets: 0 }],
      isLoading: false,
    }
    mockProductos = { data: [{ id: 1, nombre: 'Cerveza', precio: 5 }] }
    mockTicketRollos = { data: [{ productoId: 1, numeroInicial: 1, numeroFinal: null }] }

    const { default: Dashboard } = await import('../Dashboard')
    render(<Dashboard />)

    expect(screen.getByText('📦 Stock')).toBeInTheDocument()
    expect(screen.getByText('Cerrar caja')).toBeInTheDocument()
  })

  it('shows modal to create ticketera when clicking crear', async () => {
    mockEventos = {
      data: [{ id: 1, fecha: '2026-06-22', estado: 'Abierto', totalVendido: 0, totalTickets: 0 }],
      isLoading: false,
    }
    mockProductos = { data: [{ id: 1, nombre: 'Cerveza', precio: 5 }] }
    mockTicketRollos = { data: [] }
    mockStocks = [{ productoId: 1, productoNombre: 'Cerveza', stock: 10, consumo: 0, sinStockNecesario: false }]

    const { default: Dashboard } = await import('../Dashboard')
    render(<Dashboard />)

    const crearBtn = screen.getByText('+ Crear ticketera')
    await userEvent.click(crearBtn)

    expect(screen.getByRole('heading', { name: /Crear ticketera/ })).toBeInTheDocument()
  })

  it('disables crear ticketera when stock is 0', async () => {
    mockEventos = {
      data: [{ id: 1, fecha: '2026-06-22', estado: 'Abierto', totalVendido: 0, totalTickets: 0 }],
      isLoading: false,
    }
    mockProductos = { data: [{ id: 1, nombre: 'Cerveza', precio: 5 }] }
    mockTicketRollos = { data: [] }
    mockStocks = [{ productoId: 1, productoNombre: 'Cerveza', stock: 0, consumo: 0, sinStockNecesario: false }]

    const { default: Dashboard } = await import('../Dashboard')
    render(<Dashboard />)

    const crearBtn = screen.getByText('+ Crear ticketera')
    expect(crearBtn).toBeDisabled()
    expect(crearBtn).toHaveAttribute('title', 'Definí stock primero')
  })
})
