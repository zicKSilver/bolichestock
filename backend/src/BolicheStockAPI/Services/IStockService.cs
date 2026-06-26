using BolicheStockAPI.DTOs;

namespace BolicheStockAPI.Services;

public interface IStockService
{
    Task<List<StockItemDto>> GetByEventoAsync(int eventoId);
    Task UpdateBatchAsync(int eventoId, BulkStockRequestDto dto);
}
