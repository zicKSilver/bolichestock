import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { api } from '../api'

const mockFetch = vi.fn()
globalThis.fetch = mockFetch

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.clearAllMocks()
})

function mockResponse(data: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  } as Response)
}

describe('api.login', () => {
  it('calls POST /api/auth/login with credentials', async () => {
    const response = { token: 'abc', nombreUsuario: 'admin' }
    mockFetch.mockResolvedValue(mockResponse(response))

    const result = await api.login('admin', 'pass123')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/login'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ nombreUsuario: 'admin', password: 'pass123' }),
      })
    )
    expect(result).toEqual(response)
  })
})

describe('api.getProductos', () => {
  it('returns productos list', async () => {
    const productos = [{ id: 1, nombre: 'Cerveza', precio: 5 }]
    mockFetch.mockResolvedValue(mockResponse(productos))

    const result = await api.getProductos()

    expect(result).toEqual(productos)
  })
})

describe('api.abrirEvento', () => {
  it('calls POST /api/eventos with fecha', async () => {
    const evento = { id: 1, fecha: '2026-06-22', estado: 'Abierto' }
    mockFetch.mockResolvedValue(mockResponse(evento))

    const result = await api.abrirEvento('2026-06-22')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/eventos'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ fecha: '2026-06-22' }),
      })
    )
    expect(result).toEqual(evento)
  })
})

describe('api.getCierresPaged', () => {
  it('returns paged cierres', async () => {
    const paged = { items: [], totalCount: 0, page: 1, pageSize: 20 }
    mockFetch.mockResolvedValue(mockResponse(paged))

    const result = await api.getCierresPaged(1)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/eventos/cierres?page=1&pageSize=20'),
      expect.any(Object)
    )
    expect(result).toEqual(paged)
  })
})
