using Microsoft.EntityFrameworkCore;
using BolicheStockAPI.Data;
using BolicheStockAPI.Common;
using BolicheStockAPI.Models;

namespace BolicheStockAPI.Repositories;

public class EventoRepository : IEventoRepository
{
    private readonly AppDbContext _context;

    public EventoRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Evento>> GetAllAsync()
    {
        return await _context.Eventos
            .Include(e => e.ProductoEventoTickets)
            .ThenInclude(pet => pet.Producto)
            .OrderByDescending(e => e.Fecha)
            .ToListAsync();
    }

    public async Task<PagedResult<Evento>> GetPagedAsync(int page, int pageSize)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var query = _context.Eventos.Include(e => e.ProductoEventoTickets).ThenInclude(pet => pet.Producto);

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(e => e.Fecha)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<Evento>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<Evento?> GetWithProductoEventoTicketsAsync(int id)
    {
        return await _context.Eventos
            .Include(e => e.ProductoEventoTickets)
            .ThenInclude(pet => pet.Producto)
            .FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<Evento> AddAsync(Evento evento)
    {
        _context.Eventos.Add(evento);
        await _context.SaveChangesAsync();
        return evento;
    }

    public async Task<Evento> UpdateAsync(Evento evento)
    {
        _context.Eventos.Update(evento);
        await _context.SaveChangesAsync();
        return evento;
    }
}
