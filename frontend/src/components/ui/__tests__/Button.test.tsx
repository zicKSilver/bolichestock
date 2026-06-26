import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Button from '../Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Guardar</Button>)
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()
  })

  it('shows spinner when loading and disables the button', () => {
    render(<Button loading>Guardar</Button>)
    const btn = screen.getByRole('button')
    expect(btn.querySelector('svg')).toBeInTheDocument()
    expect(btn).toBeDisabled()
  })

  it('does not render children when loading', () => {
    render(<Button loading>Guardar</Button>)
    expect(screen.queryByText('Guardar')).not.toBeInTheDocument()
  })
})
