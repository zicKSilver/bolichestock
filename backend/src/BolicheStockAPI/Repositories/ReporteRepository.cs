using Microsoft.EntityFrameworkCore;
using BolicheStockAPI.Data;
using BolicheStockAPI.Models;

namespace BolicheStockAPI.Repositories;

public class ReporteRepository : IReporteRepository
{
    private readonly AppDbContext _context;

    public ReporteRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductoEventoTicket>> GetByFechaRangeAsync(DateTime desde, DateTime hasta, int? productoId = null)
    {
        var query = _context.ProductoEventoTickets
            .Include(pet => pet.Producto)
            .Include(pet => pet.Evento)
                .ThenInclude(e => e.CierreCaja)
            .Where(pet => pet.NumeroFinal.HasValue)
            .Where(pet => pet.Evento.Fecha >= desde.Date && pet.Evento.Fecha < (hasta.Date == DateTime.MaxValue.Date ? DateTime.MaxValue : hasta.Date.AddDays(1)));

        if (productoId.HasValue)
            query = query.Where(pet => pet.ProductoId == productoId.Value);

        return await query.ToListAsync();
    }
}
