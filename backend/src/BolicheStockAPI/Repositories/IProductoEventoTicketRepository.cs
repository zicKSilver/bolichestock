using BolicheStockAPI.Common;
using BolicheStockAPI.Models;

namespace BolicheStockAPI.Repositories;

public interface IProductoEventoTicketRepository
{
    Task<List<ProductoEventoTicket>> GetByEventoIdAsync(int eventoId);
    Task<PagedResult<ProductoEventoTicket>> GetPagedByEventoIdAsync(int eventoId, int page, int pageSize);
    Task<ProductoEventoTicket?> GetByIdAsync(int id);
    Task<ProductoEventoTicket> AddAsync(ProductoEventoTicket entity);
    Task<ProductoEventoTicket> UpdateAsync(ProductoEventoTicket entity);
    Task<bool> DeleteAsync(int id);
}
