using BolicheStockAPI.Common;
using BolicheStockAPI.DTOs;
using BolicheStockAPI.Models;
using BolicheStockAPI.Repositories;
using BolicheStockAPI.Services;
using Moq;

namespace BolicheStock.Tests;

public class ProductoServiceTests
{
    private readonly Mock<IProductoRepository> _repo = new();
    private readonly ProductoService _service;

    public ProductoServiceTests()
    {
        _service = new ProductoService(_repo.Object);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllProductos()
    {
        var productos = new List<Producto>
        {
            new() { Id = 1, Nombre = "Pizza", Precio = 10 },
            new() { Id = 2, Nombre = "Cerveza", Precio = 5 }
        };
        _repo.Setup(r => r.GetAllAsync()).ReturnsAsync(productos);

        var result = await _service.GetAllAsync();

        Assert.Equal(2, result.Count);
        Assert.Equal("Pizza", result[0].Nombre);
    }

    [Fact]
    public async Task GetPagedAsync_ReturnsPagedResult()
    {
        var paged = new PagedResult<Producto>
        {
            Items = [new Producto { Id = 1, Nombre = "Pizza", Precio = 10 }],
            TotalCount = 1,
            Page = 1,
            PageSize = 10
        };
        _repo.Setup(r => r.GetPagedAsync(1, 10, null)).ReturnsAsync(paged);

        var result = await _service.GetPagedAsync(1, 10);

        Assert.Single(result.Items);
        Assert.Equal(1, result.TotalCount);
    }

    [Fact]
    public async Task GetPagedAsync_WithSearch_FiltersResults()
    {
        var paged = new PagedResult<Producto>
        {
            Items = [new Producto { Id = 1, Nombre = "Pizza", Precio = 10 }],
            TotalCount = 1,
            Page = 1,
            PageSize = 10
        };
        _repo.Setup(r => r.GetPagedAsync(1, 10, "pizza")).ReturnsAsync(paged);

        var result = await _service.GetPagedAsync(1, 10, "pizza");

        Assert.Single(result.Items);
        _repo.Verify(r => r.GetPagedAsync(1, 10, "pizza"), Times.Once);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsProducto_WhenExists()
    {
        var producto = new Producto { Id = 1, Nombre = "Pizza", Precio = 10 };
        _repo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(producto);

        var result = await _service.GetByIdAsync(1);

        Assert.NotNull(result);
        Assert.Equal("Pizza", result!.Nombre);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenNotExists()
    {
        _repo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Producto?)null);

        var result = await _service.GetByIdAsync(99);

        Assert.Null(result);
    }

    [Fact]
    public async Task CreateAsync_CreatesAndReturnsProducto()
    {
        var dto = new ProductoRequestDto { Nombre = "Pizza", Precio = 10 };
        var created = new Producto { Id = 1, Nombre = "Pizza", Precio = 10 };
        _repo.Setup(r => r.AddAsync(It.IsAny<Producto>())).ReturnsAsync(created);

        var result = await _service.CreateAsync(dto);

        Assert.NotNull(result);
        Assert.Equal("Pizza", result.Nombre);
        Assert.Equal(1, result.Id);
    }

    [Fact]
    public async Task UpdateAsync_UpdatesAndReturnsProducto_WhenExists()
    {
        var existing = new Producto { Id = 1, Nombre = "Pizza", Precio = 10 };
        var dto = new ProductoRequestDto { Nombre = "Pizza XL", Precio = 15 };
        var updated = new Producto { Id = 1, Nombre = "Pizza XL", Precio = 15 };

        _repo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existing);
        _repo.Setup(r => r.UpdateAsync(It.IsAny<Producto>())).ReturnsAsync(updated);

        var result = await _service.UpdateAsync(1, dto);

        Assert.NotNull(result);
        Assert.Equal("Pizza XL", result!.Nombre);
        Assert.Equal(15, result.Precio);
    }

    [Fact]
    public async Task UpdateAsync_ReturnsNull_WhenNotExists()
    {
        _repo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Producto?)null);

        var result = await _service.UpdateAsync(99, new ProductoRequestDto());

        Assert.Null(result);
    }

    [Fact]
    public async Task DeleteAsync_ReturnsTrue_WhenExists()
    {
        _repo.Setup(r => r.DeleteAsync(1)).ReturnsAsync(true);

        var result = await _service.DeleteAsync(1);

        Assert.True(result);
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFalse_WhenNotExists()
    {
        _repo.Setup(r => r.DeleteAsync(99)).ReturnsAsync(false);

        var result = await _service.DeleteAsync(99);

        Assert.False(result);
    }
}
