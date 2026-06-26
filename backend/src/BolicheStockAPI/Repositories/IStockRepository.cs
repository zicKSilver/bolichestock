using BolicheStockAPI.Models;

namespace BolicheStockAPI.Repositories;

public interface IStockRepository
{
    Task<List<ProductoEventoStock>> GetByEventoIdAsync(int eventoId);
    Task UpsertBatchAsync(int eventoId, List<ProductoEventoStock> stocks);
}
