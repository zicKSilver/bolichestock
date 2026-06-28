import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { PagedResult } from '../../../types/common'
import type { ProductoEventoTicket } from '../../../types/evento'

let mockTicketRollosPaged: { data: PagedResult<ProductoEventoTicket> } = { data: { items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 1 } }
const mockUpdateTicketRollo = { mutateAsync: vi.fn(), isPending: false }
const mockCreateTicketRollo = { mutateAsync: vi.fn(), isPending: false }
const mockDeleteTicketRollo = { mutateAsync: vi.fn(), isPending: false }

vi.mock('../../../hooks/useTicketRollos', () => ({
  useTicketRollosPaged: () => mockTicketRollosPaged,
  useUpdateTicketRollo: () => mockUpdateTicketRollo,
  useCreateTicketRollo: () => mockCreateTicketRollo,
  useDeleteTicketRollo: () => mockDeleteTicketRollo,
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const eventoActivo = { id: 1, fecha: '2026-06-22', estado: 'Abierto', totalVendido: 0, totalTickets: 0 }
const productos = [
  { id: 1, nombre: 'Cerveza', precio: 5 },
  { id: 2, nombre: 'Vino', precio: 10 },
]

beforeEach(() => {
  vi.clearAllMocks()
  mockTicketRollosPaged = { data: { items: [] as ProductoEventoTicket[], totalCount: 0, page: 1, pageSize: 20, totalPages: 1 } }
})

async function renderTicketeras() {
  const { default: TicketerasSection } = await import('../TicketerasSection')
  return render(<TicketerasSection eventoActivo={eventoActivo} productos={productos} stocks={[]} />)
}

describe('TicketerasSection', () => {
  it('shows empty state when no rollos', async () => {
    await renderTicketeras()
    expect(screen.getByText('🎟️ Ticketeras')).toBeInTheDocument()
    expect(screen.getByText('No hay ticketeras cargadas')).toBeInTheDocument()
  })

  it('renders rollos grouped by producto', async () => {
    mockTicketRollosPaged = {
      data: {
        items: [
          { id: 1, eventoId: 1, productoId: 1, productoNombre: 'Cerveza', productoPrecio: 5, numeroInicial: 1, numeroFinal: null, totalTicketera: 250, completada: false, ticketsCalculados: 0, subtotal: 0 },
          { id: 2, eventoId: 1, productoId: 2, productoNombre: 'Vino', productoPrecio: 10, numeroInicial: 1, numeroFinal: 50, totalTicketera: 100, completada: true, ticketsCalculados: 50, subtotal: 500 },
        ],
        totalCount: 2,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      },
    }
    await renderTicketeras()
    expect(screen.getByText('Cerveza')).toBeInTheDocument()
    expect(screen.getByText('Vino')).toBeInTheDocument()
    expect(screen.getByText('✓ Completada')).toBeInTheDocument()
    expect(screen.getByText('● en uso')).toBeInTheDocument()
  })

  it('opens delete modal for a completed rollo', async () => {
    mockTicketRollosPaged = {
      data: {
        items: [
          { id: 1, eventoId: 1, productoId: 1, productoNombre: 'Cerveza', productoPrecio: 5, numeroInicial: 1, numeroFinal: 50, totalTicketera: 250, completada: true, ticketsCalculados: 50, subtotal: 250 },
        ],
        totalCount: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      },
    }
    await renderTicketeras()
    await userEvent.click(screen.getByText('Eliminar'))
    expect(screen.getByText(/¿Eliminar ticketera/)).toBeInTheDocument()
  })

  it('opens edit modal for an in-use rollo', async () => {
    mockTicketRollosPaged = {
      data: {
        items: [
          { id: 1, eventoId: 1, productoId: 1, productoNombre: 'Cerveza', productoPrecio: 5, numeroInicial: 1, numeroFinal: null, totalTicketera: 250, completada: false, ticketsCalculados: 0, subtotal: 0 },
        ],
        totalCount: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      },
    }
    await renderTicketeras()
    await userEvent.click(screen.getByText('Editar'))
    expect(screen.getByText(/Editando ticketera/)).toBeInTheDocument()
    expect(screen.getByDisplayValue('1')).toBeInTheDocument()
  })

  it('opens nueva ticketera modal for in-use rollo', async () => {
    mockTicketRollosPaged = {
      data: {
        items: [
          { id: 1, eventoId: 1, productoId: 1, productoNombre: 'Cerveza', productoPrecio: 5, numeroInicial: 1, numeroFinal: null, totalTicketera: 250, completada: false, ticketsCalculados: 0, subtotal: 0 },
        ],
        totalCount: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      },
    }
    await renderTicketeras()
    await userEvent.click(screen.getByText('+ Nueva'))
    expect(screen.getByText('Completar ticketera y crear nueva')).toBeInTheDocument()
  })

  it('shows deshacer button when other completed rollos exist', async () => {
    mockTicketRollosPaged = {
      data: {
        items: [
          { id: 1, eventoId: 1, productoId: 1, productoNombre: 'Cerveza', productoPrecio: 5, numeroInicial: 1, numeroFinal: null, totalTicketera: 250, completada: false, ticketsCalculados: 0, subtotal: 0 },
          { id: 2, eventoId: 1, productoId: 1, productoNombre: 'Cerveza', productoPrecio: 5, numeroInicial: 51, numeroFinal: 100, totalTicketera: 250, completada: true, ticketsCalculados: 50, subtotal: 250 },
        ],
        totalCount: 2,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      },
    }
    await renderTicketeras()
    expect(screen.getByText('Deshacer')).toBeInTheDocument()
  })
})
