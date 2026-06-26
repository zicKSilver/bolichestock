import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Input from '../Input'

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input placeholder="Nombre" />)
    expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    render(<Input label="Usuario" />)
    expect(screen.getByText('Usuario')).toBeInTheDocument()
  })

  it('does not render label when not provided', () => {
    const { container } = render(<Input />)
    expect(container.querySelector('label')).not.toBeInTheDocument()
  })

  it('shows error message when error prop is set', () => {
    render(<Input error="Campo obligatorio" />)
    expect(screen.getByText('Campo obligatorio')).toBeInTheDocument()
    expect(screen.getByText('Campo obligatorio')).toHaveClass('text-red-400')
  })

  it('spreads additional input props', () => {
    render(<Input type="password" autoFocus />)
    const input = document.querySelector('input[type="password"]')
    expect(input).toBeInTheDocument()
  })
})
