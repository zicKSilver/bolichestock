using BolicheStockAPI.Models;

namespace BolicheStockAPI.Repositories;

public interface IReporteRepository
{
    Task<List<ProductoEventoTicket>> GetByFechaRangeAsync(DateTime desde, DateTime hasta, int? productoId = null);
}
