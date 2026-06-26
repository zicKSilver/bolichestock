interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  loading?: boolean
}

const variants = {
  primary: 'bg-primary text-black shadow-md shadow-primary/30 hover:shadow-lg hover:shadow-primary/40',
  secondary: 'bg-secondary text-black shadow-md shadow-secondary/30 hover:shadow-lg hover:shadow-secondary/40',
  danger: 'bg-red-600 text-white shadow-md shadow-red-600/30 hover:shadow-lg hover:shadow-red-600/40',
  ghost: 'border border-borde/50 text-primary hover:bg-white/5 hover:border-primary/50',
}

function Spinner() {
  return (
    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export default function Button({ children, variant = 'primary', loading, disabled, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:translate-y-0 disabled:opacity-50 ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  )
}
