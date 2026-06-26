import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  children: ReactNode
  className?: string
  variant?: 'default' | 'glass'
}

export default function Card({ title, children, className = '', variant = 'default' }: CardProps) {
  const base = variant === 'glass'
    ? 'rounded-xl border border-borde/30 bg-white/5 backdrop-blur-md'
    : 'rounded-xl border border-borde bg-tarjeta shadow-md shadow-black/20 hover:shadow-lg hover:shadow-black/30 hover:border-primary/50'

  return (
    <div className={`${base} p-4 transition-all duration-200 hover:scale-[1.01] ${className}`}>
      {title && <h2 className="mb-3 text-lg font-semibold text-white">{title}</h2>}
      {children}
    </div>
  )
}
