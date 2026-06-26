import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

let mockReporte: { data: { items: unknown[]; descuentoManual: number; totalBruto: number; totalNeto: number } | undefined; isLoading: boolean } = {
  data: undefined,
  isLoading: false,
}
let mockProductos: { data: { id: number; nombre: string; precio: number }[] } = { data: [] }

vi.mock('../../hooks/useReporte', () => ({
  useReporte: () => mockReporte,
}))

vi.mock('../../hooks/useProductos', () => ({
  useProductos: () => mockProductos,
}))

vi.mock('../../utils/dates', () => ({
  formatDateLocal: (d: string) => d,
}))

vi.mock('../../utils/pdf', () => ({
  buildReportePdfDoc: () => ({ output: () => '', save: vi.fn() }),
}))

vi.mock('xlsx', () => ({
  utils: {
    json_to_sheet: vi.fn(() => ({})),
    book_new: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
    writeFile: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockReporte = { data: undefined, isLoading: false }
  mockProductos = { data: [] }
})

describe('Reportes', () => {
  it('renders title and date inputs', async () => {
    const { default: Reportes } = await import('../Reportes')
    render(<Reportes />)
    expect(screen.getByText('Reportes')).toBeInTheDocument()
    expect(screen.getByText('Desde')).toBeInTheDocument()
    expect(screen.getByText('Hasta')).toBeInTheDocument()
  })

  it('shows loading skeleton when loading', async () => {
    mockReporte = { data: undefined, isLoading: true }
    const { default: Reportes } = await import('../Reportes')
    const { container } = render(<Reportes />)
    const skeletons = container.querySelectorAll('[class*="shimmer"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows empty state when no data', async () => {
    mockReporte = { data: { items: [], descuentoManual: 0, totalBruto: 0, totalNeto: 0 }, isLoading: false }
    const { default: Reportes } = await import('../Reportes')
    render(<Reportes />)
    expect(screen.getByText('Sin ventas')).toBeInTheDocument()
    expect(screen.getByText('No hay ventas para el período seleccionado.')).toBeInTheDocument()
  })

  it('shows report table when items exist', async () => {
    mockReporte = {
      data: {
        items: [{ producto: 'Cerveza', cantidadTotal: 10, precioPromedioPonderado: 50, totalVendido: 500 }],
        descuentoManual: 50,
        totalBruto: 500,
        totalNeto: 450,
      },
      isLoading: false,
    }
    const { default: Reportes } = await import('../Reportes')
    render(<Reportes />)
    expect(screen.getByText('Cerveza')).toBeInTheDocument()
    const amounts = screen.getAllByText((t) => t.includes('$500.00'))
    expect(amounts.length).toBeGreaterThan(0)
    expect(screen.getByText((t) => t.includes('450.00') && t.includes('$'))).toBeInTheDocument()
  })

  it('shows Excel and PDF buttons when items exist', async () => {
    mockReporte = {
      data: {
        items: [{ producto: 'Cerveza', cantidadTotal: 10, precioPromedioPonderado: 50, totalVendido: 500 }],
        descuentoManual: 0,
        totalBruto: 500,
        totalNeto: 500,
      },
      isLoading: false,
    }
    const { default: Reportes } = await import('../Reportes')
    render(<Reportes />)
    expect(screen.getByRole('button', { name: /Excel/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Vista previa PDF/ })).toBeInTheDocument()
  })

  it('does not show action buttons when no items', async () => {
    mockReporte = { data: { items: [], descuentoManual: 0, totalBruto: 0, totalNeto: 0 }, isLoading: false }
    const { default: Reportes } = await import('../Reportes')
    render(<Reportes />)
    expect(screen.queryByText('Excel')).not.toBeInTheDocument()
    expect(screen.queryByText('Vista previa PDF')).not.toBeInTheDocument()
  })

  it('renders product select with options', async () => {
    mockProductos = { data: [{ id: 1, nombre: 'Cerveza', precio: 5 }] }
    const { default: Reportes } = await import('../Reportes')
    render(<Reportes />)
    expect(screen.getByText('Todos los productos')).toBeInTheDocument()
    expect(screen.getByText('Cerveza')).toBeInTheDocument()
  })
})
