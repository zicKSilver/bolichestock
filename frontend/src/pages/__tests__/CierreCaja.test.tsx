import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockNavigate = vi.fn()
let mockId = '1'
let mockEvento: unknown = null
let mockCierre: unknown = null
let mockRollos: unknown[] = []
let mockStocks: unknown[] = []
const mockUpdateTicketRollo = vi.fn()
const mockCerrarEvento = vi.fn()
const mockUpdateStockMutate = vi.fn()

vi.mock('../../hooks/useStock', () => ({
  useStock: () => ({ data: mockStocks }),
  useUpdateStock: () => ({ mutate: mockUpdateStockMutate, isPending: false }),
}))

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: mockId }),
  useNavigate: () => mockNavigate,
}))

vi.mock('../../hooks/useTicketRollos', () => ({
  useTicketRollos: () => ({ data: mockRollos, refetch: vi.fn() }),
  useUpdateTicketRollo: () => ({ mutateAsync: mockUpdateTicketRollo, isPending: false }),
}))

vi.mock('../../hooks/useEventos', () => ({
  useCerrarEvento: () => ({ mutateAsync: mockCerrarEvento, isPending: false }),
}))

vi.mock('../../services/api', () => ({
  api: {
    getEvento: () => Promise.resolve(mockEvento),
    getCierre: () => Promise.resolve(mockCierre),
  },
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockId = '1'
  mockEvento = { id: 1, fecha: '2026-06-22T00:00:00.000Z', estado: 'Abierto', totalVendido: 0, totalTickets: 0 }
  mockCierre = null
  mockRollos = []
  mockStocks = []
})

describe('CierreCaja', () => {
  it('shows loading skeleton while fetching data', async () => {
    mockEvento = undefined
    const { default: CierreCaja } = await import('../CierreCaja')
    const { container } = render(<CierreCaja />)
    const skeletons = container.querySelectorAll('[class*="shimmer"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows event closed summary when cierre exists', async () => {
    mockCierre = {
      id: 1,
      eventoId: 1,
      totalVendido: 5000,
      efectivoEnCaja: 4800,
      descuentoManual: 200,
      diferencia: 0,
      fechaHoraCierre: '2026-06-22T23:00:00.000Z',
    }
    const { default: CierreCaja } = await import('../CierreCaja')
    render(<CierreCaja />)
    expect(await screen.findByText('✅ Evento cerrado')).toBeInTheDocument()
    expect(screen.getByText('$5000.00')).toBeInTheDocument()
    expect(screen.getByText('-$200.00')).toBeInTheDocument()
    expect(screen.getByText(/Descargar PDF/)).toBeInTheDocument()
  })

  it('calls updateTicketRollo when toggling completada', async () => {
    mockRollos = [
      { id: 1, eventoId: 1, productoId: 1, productoNombre: 'Cerveza', productoPrecio: 5, numeroInicial: 1, numeroFinal: null, totalTicketera: 250, completada: false, ticketsCalculados: 0, subtotal: 0 },
    ]
    const { default: CierreCaja } = await import('../CierreCaja')
    render(<CierreCaja />)
    const checkbox = await screen.findByRole('checkbox')
    await userEvent.click(checkbox)
    expect(mockUpdateTicketRollo).toHaveBeenCalledWith(
      expect.objectContaining({ eventoId: 1, id: 1, completada: true })
    )
  })

  it('disables cerrar button when no ticketeras are completed', async () => {
    mockRollos = [
      { id: 1, eventoId: 1, productoId: 1, productoNombre: 'Cerveza', productoPrecio: 5, numeroInicial: 1, numeroFinal: null, totalTicketera: 250, completada: false, ticketsCalculados: 0, subtotal: 0 },
    ]
    const { default: CierreCaja } = await import('../CierreCaja')
    render(<CierreCaja />)
    const efectivoInput = (await screen.findAllByPlaceholderText('0.00'))[0]
    await userEvent.type(efectivoInput, '100')
    const cerrarBtn = screen.getByText('Cerrar evento').closest('button')
    expect(cerrarBtn).toBeDisabled()
  })

  it('opens modal when diferencia is negativa and no descuento', async () => {
    mockRollos = [
      { id: 1, eventoId: 1, productoId: 1, productoNombre: 'Cerveza', productoPrecio: 5, numeroInicial: 1, numeroFinal: 10, totalTicketera: 250, completada: false, ticketsCalculados: 10, subtotal: 50 },
    ]
    mockStocks = [{ productoId: 1, productoNombre: 'Cerveza', stock: 10, consumo: 0, sinStockNecesario: false }]
    const { default: CierreCaja } = await import('../CierreCaja')
    render(<CierreCaja />)
    const efectivoInput = (await screen.findAllByPlaceholderText('0.00'))[0]
    await userEvent.type(efectivoInput, '10')
    await userEvent.click(screen.getByText('Cerrar evento'))
    expect(screen.getByText('Diferencia negativa')).toBeInTheDocument()
  })
})
