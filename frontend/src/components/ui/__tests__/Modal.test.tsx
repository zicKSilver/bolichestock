import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from '../Modal'

describe('Modal', () => {
  it('renders title and children', () => {
    render(
      <Modal open={true} onOpenChange={() => {}} title="Mi Modal">
        <p>contenido</p>
      </Modal>
    )
    expect(screen.getByText('Mi Modal')).toBeInTheDocument()
    expect(screen.getByText('contenido')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <Modal open={false} onOpenChange={() => {}} title="Mi Modal">
        <p>contenido</p>
      </Modal>
    )
    expect(screen.queryByText('Mi Modal')).not.toBeInTheDocument()
  })

  it('calls onOpenChange with false when close button is clicked', async () => {
    const onOpenChange = vi.fn()
    render(
      <Modal open={true} onOpenChange={onOpenChange} title="Mi Modal">
        <p>contenido</p>
      </Modal>
    )
    const closeBtn = screen.getByRole('button', { name: '' })
    await userEvent.click(closeBtn)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('applies custom maxWidth when provided', () => {
    render(
      <Modal open={true} onOpenChange={() => {}} title="Modal" maxWidth="max-w-5xl">
        <p>contenido</p>
      </Modal>
    )
    const content = screen.getByText('contenido').closest('[class*="max-w-5xl"]')
    expect(content).toBeInTheDocument()
  })
})
