export function formatDateLocal(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', { timeZone: 'UTC' })
}
