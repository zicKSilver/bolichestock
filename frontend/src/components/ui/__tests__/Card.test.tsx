import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Card from '../Card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card><p>contenido</p></Card>)
    expect(screen.getByText('contenido')).toBeInTheDocument()
  })

  it('renders title when provided', () => {
    render(<Card title="Mi Título"><p>contenido</p></Card>)
    expect(screen.getByText('Mi Título')).toBeInTheDocument()
  })

  it('does not render title when not provided', () => {
    const { container } = render(<Card><p>contenido</p></Card>)
    expect(container.querySelector('h2')).not.toBeInTheDocument()
  })
})
