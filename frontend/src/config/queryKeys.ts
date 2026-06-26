export const queryKeys = {
  eventos: ['eventos'] as const,
  productos: ['productos'] as const,
  reporte: (desde: string, hasta: string, productoId?: number) =>
    ['reporte', desde, hasta, productoId] as const,
  ticketRollos: {
    all: (eventoId: number) => ['ticket-rollos', eventoId] as const,
    paged: (eventoId: number, page: number) => ['ticket-rollos', eventoId, 'paged', page] as const,
  },
  cierres: (page: number) => ['cierres', page] as const,
  stocks: (eventoId: number) => ['stocks', eventoId] as const,
}
