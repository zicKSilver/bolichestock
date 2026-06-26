interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="mb-4">
      {label && <label className="mb-1 block text-sm text-gray-200">{label}</label>}
      <input
        className={`w-full rounded-lg border border-borde bg-fondo px-4 py-3 text-white placeholder-gray-500 outline-none transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_2px_rgba(232,121,249,0.25)] ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  )
}
