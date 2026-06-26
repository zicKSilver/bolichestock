using BolicheStockAPI.Common;
using BolicheStockAPI.Models;

namespace BolicheStockAPI.Repositories;

public interface IEventoRepository
{
    Task<List<Evento>> GetAllAsync();
    Task<PagedResult<Evento>> GetPagedAsync(int page, int pageSize);
    Task<Evento?> GetWithProductoEventoTicketsAsync(int id);
    Task<Evento> AddAsync(Evento evento);
    Task<Evento> UpdateAsync(Evento evento);
}
