using BolicheStockAPI.Common;
using BolicheStockAPI.DTOs;
using BolicheStockAPI.Models;
using BolicheStockAPI.Repositories;

namespace BolicheStockAPI.Services;

public class ProductoService : IProductoService
{
    private readonly IProductoRepository _repository;

    public ProductoService(IProductoRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<ProductoResponseDto>> GetAllAsync()
    {
        var productos = await _repository.GetAllAsync();
        return productos.Select(MapToDto).ToList();
    }

    public async Task<PagedResult<ProductoResponseDto>> GetPagedAsync(int page, int pageSize, string? search = null)
    {
        var paged = await _repository.GetPagedAsync(page, pageSize, search);
        return new PagedResult<ProductoResponseDto>
        {
            Items = paged.Items.Select(MapToDto).ToList(),
            TotalCount = paged.TotalCount,
            Page = paged.Page,
            PageSize = paged.PageSize
        };
    }

    public async Task<ProductoResponseDto?> GetByIdAsync(int id)
    {
        var producto = await _repository.GetByIdAsync(id);
        return producto is null ? null : MapToDto(producto);
    }

    public async Task<ProductoResponseDto> CreateAsync(ProductoRequestDto dto)
    {
        var producto = new Producto
        {
            Nombre = dto.Nombre,
            Precio = dto.Precio
        };

        var created = await _repository.AddAsync(producto);
        return MapToDto(created);
    }

    public async Task<ProductoResponseDto?> UpdateAsync(int id, ProductoRequestDto dto)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing is null) return null;

        existing.Nombre = dto.Nombre;
        existing.Precio = dto.Precio;

        var updated = await _repository.UpdateAsync(existing);
        return MapToDto(updated);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        return await _repository.DeleteAsync(id);
    }

    private static ProductoResponseDto MapToDto(Producto p) => new()
    {
        Id = p.Id,
        Nombre = p.Nombre,
        Precio = p.Precio
    };
}
