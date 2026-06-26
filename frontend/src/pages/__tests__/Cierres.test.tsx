import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockNavigate = vi.fn()
let mockPagedData: { items: unknown[]; totalCount: number; page: number; totalPages: number } | undefined = undefined

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('../../services/api', () => ({
  api: {
    getCierresPaged: () => Promise.resolve(mockPagedData!),
  },
}))

vi.mock('../../utils/dates', () => ({
  formatDateLocal: (d: string) => d,
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockPagedData = undefined
})

describe('Cierres', () => {
  it('shows loading skeleton when loading', async () => {
    mockPagedData = undefined
    const { default: Cierres } = await import('../Cierres')
    const { container } = render(<Cierres />)
    const skeletons = container.querySelectorAll('[class*="shimmer"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows empty state when no cierres', async () => {
    mockPagedData = { items: [], totalCount: 0, page: 1, totalPages: 1 }
    const { default: Cierres } = await import('../Cierres')
    render(<Cierres />)
    expect(await screen.findByText('Sin cierres')).toBeInTheDocument()
    expect(screen.getByText('Todavía no hay ningún cierre de caja registrado.')).toBeInTheDocument()
  })

  it('renders list of cierres', async () => {
    mockPagedData = {
      items: [
        { id: 1, eventoId: 1, fechaEvento: '2026-06-20', totalVendido: 5000, efectivoEnCaja: 4800, diferencia: -200, fechaHoraCierre: '2026-06-20T23:00:00.000Z' },
        { id: 2, eventoId: 2, fechaEvento: '2026-06-19', totalVendido: 3000, efectivoEnCaja: 3100, diferencia: 100, fechaHoraCierre: '2026-06-19T23:00:00.000Z' },
      ],
      totalCount: 2,
      page: 1,
      totalPages: 1,
    }
    const { default: Cierres } = await import('../Cierres')
    render(<Cierres />)
    expect(await screen.findByText('2026-06-20')).toBeInTheDocument()
    expect(screen.getByText('2026-06-19')).toBeInTheDocument()
    expect(screen.getByText('$5000.00')).toBeInTheDocument()
    expect(screen.getByText('$3000.00')).toBeInTheDocument()
  })

  it('navigates to cierre detail on click', async () => {
    mockPagedData = {
      items: [
        { id: 1, eventoId: 5, fechaEvento: '2026-06-20', totalVendido: 5000, efectivoEnCaja: 4800, diferencia: -200, fechaHoraCierre: '2026-06-20T23:00:00.000Z' },
      ],
      totalCount: 1,
      page: 1,
      totalPages: 1,
    }
    const { default: Cierres } = await import('../Cierres')
    render(<Cierres />)
    await userEvent.click(await screen.findByText('2026-06-20'))
    expect(mockNavigate).toHaveBeenCalledWith('/cierre/5')
  })

  it('shows negative diferencia badge in red', async () => {
    mockPagedData = {
      items: [
        { id: 1, eventoId: 1, fechaEvento: '2026-06-20', totalVendido: 5000, efectivoEnCaja: 4800, diferencia: -200, fechaHoraCierre: '2026-06-20T23:00:00.000Z' },
      ],
      totalCount: 1,
      page: 1,
      totalPages: 1,
    }
    const { default: Cierres } = await import('../Cierres')
    render(<Cierres />)
    const negativeSpan = await screen.findByText((t) => t.includes('-200.00'))
    expect(negativeSpan.className).toContain('text-red-400')
  })

  it('shows positive diferencia badge in green', async () => {
    mockPagedData = {
      items: [
        { id: 1, eventoId: 1, fechaEvento: '2026-06-20', totalVendido: 3000, efectivoEnCaja: 3100, diferencia: 100, fechaHoraCierre: '2026-06-20T23:00:00.000Z' },
      ],
      totalCount: 1,
      page: 1,
      totalPages: 1,
    }
    const { default: Cierres } = await import('../Cierres')
    render(<Cierres />)
    expect(await screen.findByText('+$100.00')).toBeInTheDocument()
  })
})
