using Microsoft.EntityFrameworkCore;
using BolicheStockAPI.Data;
using BolicheStockAPI.Models;

namespace BolicheStockAPI.Repositories;

public class StockRepository : IStockRepository
{
    private readonly AppDbContext _context;

    public StockRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductoEventoStock>> GetByEventoIdAsync(int eventoId)
    {
        return await _context.Stocks
            .Include(s => s.Producto)
            .Where(s => s.EventoId == eventoId)
            .ToListAsync();
    }

    public async Task UpsertBatchAsync(int eventoId, List<ProductoEventoStock> stocks)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var existing = await _context.Stocks
                .Where(s => s.EventoId == eventoId)
                .ToListAsync();

            _context.Stocks.RemoveRange(existing);

            foreach (var stock in stocks)
            {
                stock.EventoId = eventoId;
                _context.Stocks.Add(stock);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}
