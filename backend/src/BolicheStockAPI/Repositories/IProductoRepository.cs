using BolicheStockAPI.Common;
using BolicheStockAPI.Models;

namespace BolicheStockAPI.Repositories;

public interface IProductoRepository
{
    Task<List<Producto>> GetAllAsync();
    Task<PagedResult<Producto>> GetPagedAsync(int page, int pageSize, string? search = null);
    Task<Producto?> GetByIdAsync(int id);
    Task<Producto> AddAsync(Producto producto);
    Task<Producto> UpdateAsync(Producto producto);
    Task<bool> DeleteAsync(int id);
}
