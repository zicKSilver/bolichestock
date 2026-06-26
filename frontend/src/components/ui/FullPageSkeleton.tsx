export default function FullPageSkeleton() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-fondo">
      <div className="flex flex-col items-center gap-4">
        <div className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-gray-400">Cargando...</p>
      </div>
    </div>
  )
}
