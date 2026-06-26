interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-lg border border-borde/50 px-3 py-1.5 text-sm text-gray-300 transition-all duration-200 hover:border-primary/50 hover:text-primary disabled:opacity-30 disabled:hover:border-borde/50 disabled:hover:text-gray-300"
      >
        Anterior
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
        .map((p, idx, arr) => (
          <span key={p} className="flex items-center gap-0.5">
            {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-gray-500">...</span>}
            <button
              onClick={() => onPageChange(p)}
              className={`min-w-8 rounded-lg px-2 py-1.5 text-sm font-semibold transition-all duration-200 ${
                p === page
                  ? 'bg-primary text-black shadow-[0_0_10px_rgba(232,121,249,0.3)]'
                  : 'text-gray-300 hover:bg-white/5 hover:text-primary'
              }`}
            >
              {p}
            </button>
          </span>
        ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-lg border border-borde/50 px-3 py-1.5 text-sm text-gray-300 transition-all duration-200 hover:border-primary/50 hover:text-primary disabled:opacity-30 disabled:hover:border-borde/50 disabled:hover:text-gray-300"
      >
        Siguiente
      </button>
    </div>
  )
}
