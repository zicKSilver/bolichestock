using BolicheStockAPI.Common;
using BolicheStockAPI.DTOs;

namespace BolicheStockAPI.Services;

public interface IProductoService
{
    Task<List<ProductoResponseDto>> GetAllAsync();
    Task<PagedResult<ProductoResponseDto>> GetPagedAsync(int page, int pageSize, string? search = null);
    Task<ProductoResponseDto?> GetByIdAsync(int id);
    Task<ProductoResponseDto> CreateAsync(ProductoRequestDto dto);
    Task<ProductoResponseDto?> UpdateAsync(int id, ProductoRequestDto dto);
    Task<bool> DeleteAsync(int id);
}
