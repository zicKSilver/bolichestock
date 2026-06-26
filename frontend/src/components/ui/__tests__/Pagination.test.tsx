import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Pagination from '../Pagination'

describe('Pagination', () => {
  it('renders page buttons when totalPages > 1', () => {
    render(<Pagination page={1} totalPages={3} onPageChange={() => {}} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Anterior')).toBeInTheDocument()
    expect(screen.getByText('Siguiente')).toBeInTheDocument()
  })

  it('returns null when totalPages <= 1', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onPageChange={() => {}} />)
    expect(container.innerHTML).toBe('')
  })

  it('calls onPageChange when clicking a page button', async () => {
    const onPageChange = vi.fn()
    render(<Pagination page={1} totalPages={3} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByText('2'))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })
})
