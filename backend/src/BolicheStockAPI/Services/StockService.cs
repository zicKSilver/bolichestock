using BolicheStockAPI.DTOs;
using BolicheStockAPI.Models;
using BolicheStockAPI.Repositories;

namespace BolicheStockAPI.Services;

public class StockService : IStockService
{
    private readonly IStockRepository _repository;

    public StockService(IStockRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<StockItemDto>> GetByEventoAsync(int eventoId)
    {
        var stocks = await _repository.GetByEventoIdAsync(eventoId);

        return stocks.Select(s => new StockItemDto
        {
            ProductoId = s.ProductoId,
            ProductoNombre = s.Producto?.Nombre ?? "",
            Stock = s.Stock,
            Consumo = s.Consumo,
            SinStockNecesario = s.SinStockNecesario,
        }).ToList();
    }

    public async Task UpdateBatchAsync(int eventoId, BulkStockRequestDto dto)
    {
        var stocks = dto.Items.Select(i => new ProductoEventoStock
        {
            ProductoId = i.ProductoId,
            Stock = i.Stock,
            Consumo = i.Consumo,
            SinStockNecesario = i.SinStockNecesario,
        }).ToList();

        await _repository.UpsertBatchAsync(eventoId, stocks);
    }
}
