using Microsoft.EntityFrameworkCore;
using BolicheStockAPI.Data;
using BolicheStockAPI.Common;
using BolicheStockAPI.Models;

namespace BolicheStockAPI.Repositories;

public class CierreCajaRepository : ICierreCajaRepository
{
    private readonly AppDbContext _context;

    public CierreCajaRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<CierreCaja?> GetByEventoIdAsync(int eventoId)
    {
        return await _context.CierresCaja
            .FirstOrDefaultAsync(c => c.EventoId == eventoId);
    }

    public async Task<PagedResult<CierreCaja>> GetPagedAsync(int page, int pageSize)
    {
        var query = _context.CierresCaja.Include(c => c.Evento).AsQueryable();

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(c => c.FechaHoraCierre)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<CierreCaja>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<CierreCaja> AddAsync(CierreCaja cierre)
    {
        _context.CierresCaja.Add(cierre);
        await _context.SaveChangesAsync();
        return cierre;
    }
}
