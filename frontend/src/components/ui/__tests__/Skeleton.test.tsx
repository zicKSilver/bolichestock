import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Skeleton, SkeletonCard, SkeletonTable } from '../Skeleton'

describe('Skeleton', () => {
  it('renders shimmer animation div', () => {
    const { container } = render(<Skeleton />)
    expect(container.querySelector('[class*="shimmer"]')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="h-8 w-1/2" />)
    const div = container.firstChild as HTMLElement
    expect(div.className).toContain('h-8')
  })
})

describe('SkeletonCard', () => {
  it('renders multiple skeleton lines', () => {
    const { container } = render(<SkeletonCard />)
    const shimmerElements = container.querySelectorAll('[class*="shimmer"]')
    expect(shimmerElements.length).toBeGreaterThanOrEqual(3)
  })
})

describe('SkeletonTable', () => {
  it('renders default 3 rows plus header', () => {
    const { container } = render(<SkeletonTable />)
    const shimmerElements = container.querySelectorAll('[class*="shimmer"]')
    expect(shimmerElements.length).toBe(4) // 1 header + 3 rows
  })

  it('renders custom number of rows', () => {
    const { container } = render(<SkeletonTable rows={5} />)
    const shimmerElements = container.querySelectorAll('[class*="shimmer"]')
    expect(shimmerElements.length).toBe(6) // 1 header + 5 rows
  })
})
