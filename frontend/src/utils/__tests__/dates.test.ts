import { describe, it, expect } from 'vitest'
import { formatDateLocal } from '../dates'

describe('formatDateLocal', () => {
  it('formats a date string in es-AR locale', () => {
    const result = formatDateLocal('2026-06-15T00:00:00.000Z')
    expect(result).toBe('15/6/2026')
  })

  it('handles end of month correctly', () => {
    const result = formatDateLocal('2026-01-31T00:00:00.000Z')
    expect(result).toBe('31/1/2026')
  })
})
