using BolicheStockAPI.DTOs;

namespace BolicheStockAPI.Services;

public interface IReporteService
{
    Task<ReporteGeneralResponseDto> GetByFechaRangeAsync(DateTime desde, DateTime hasta, int? productoId = null);
}
