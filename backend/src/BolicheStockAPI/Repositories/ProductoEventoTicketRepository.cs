using Microsoft.EntityFrameworkCore;
using BolicheStockAPI.Data;
using BolicheStockAPI.Common;
using BolicheStockAPI.Models;

namespace BolicheStockAPI.Repositories;

public class ProductoEventoTicketRepository : IProductoEventoTicketRepository
{
    private readonly AppDbContext _context;

    public ProductoEventoTicketRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductoEventoTicket>> GetByEventoIdAsync(int eventoId)
    {
        return await _context.ProductoEventoTickets
            .Include(pet => pet.Producto)
            .Where(pet => pet.EventoId == eventoId)
            .OrderBy(pet => pet.Producto!.Nombre)
            .ThenBy(pet => pet.Id)
            .ToListAsync();
    }

    public async Task<PagedResult<ProductoEventoTicket>> GetPagedByEventoIdAsync(int eventoId, int page, int pageSize)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var query = _context.ProductoEventoTickets
            .Include(pet => pet.Producto)
            .Where(pet => pet.EventoId == eventoId)
            .OrderBy(pet => pet.Producto!.Nombre)
            .ThenBy(pet => pet.Id);

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<ProductoEventoTicket>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<ProductoEventoTicket?> GetByIdAsync(int id)
    {
        return await _context.ProductoEventoTickets
            .Include(pet => pet.Producto)
            .FirstOrDefaultAsync(pet => pet.Id == id);
    }

    public async Task<ProductoEventoTicket> AddAsync(ProductoEventoTicket entity)
    {
        _context.ProductoEventoTickets.Add(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task<ProductoEventoTicket> UpdateAsync(ProductoEventoTicket entity)
    {
        _context.ProductoEventoTickets.Update(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _context.ProductoEventoTickets.FindAsync(id);
        if (entity is null) return false;
        _context.ProductoEventoTickets.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }
}
