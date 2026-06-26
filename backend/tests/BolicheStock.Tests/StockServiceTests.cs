using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using BolicheStockAPI.Data;
using BolicheStockAPI.Models;
using BolicheStockAPI.Repositories;
using BolicheStockAPI.Services;
using BolicheStockAPI.DTOs;

namespace BolicheStock.Tests;

public class StockServiceTests
{
    private static DbContextOptions<AppDbContext> CreateOptions(string name)
    {
        return new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(name)
            .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;
    }

    private AppDbContext CreateContext()
    {
        var ctx = new AppDbContext(CreateOptions(Guid.NewGuid().ToString()));

        ctx.Productos.AddRange(
            new Producto { Id = 1, Nombre = "Cerveza", Precio = 5 },
            new Producto { Id = 2, Nombre = "Agua", Precio = 3 }
        );
        ctx.Eventos.Add(
            new Evento
            {
                Id = 1,
                Fecha = new DateTime(2026, 6, 1),
                Estado = EventoEstado.Abierto,
            }
        );
        ctx.SaveChanges();

        return ctx;
    }

    [Fact]
    public async Task GetByEventoAsync_ReturnsEmpty_WhenNoStocks()
    {
        using var ctx = CreateContext();
        var service = new StockService(new StockRepository(ctx));

        var result = await service.GetByEventoAsync(1);

        Assert.Empty(result);
    }

    [Fact]
    public async Task UpdateBatchAsync_SavesAndRetrievesStocks()
    {
        using var ctx = CreateContext();
        var service = new StockService(new StockRepository(ctx));

        var dto = new BulkStockRequestDto
        {
            Items =
            [
                new StockItemDto { ProductoId = 1, ProductoNombre = "Cerveza", Stock = 15 },
                new StockItemDto { ProductoId = 2, ProductoNombre = "Agua", Stock = 10 },
            ]
        };

        await service.UpdateBatchAsync(1, dto);

        var result = await service.GetByEventoAsync(1);

        Assert.Equal(2, result.Count);

        var cerveza = result.First(s => s.ProductoId == 1);
        Assert.Equal("Cerveza", cerveza.ProductoNombre);
        Assert.Equal(15, cerveza.Stock);

        var agua = result.First(s => s.ProductoId == 2);
        Assert.Equal("Agua", agua.ProductoNombre);
        Assert.Equal(10, agua.Stock);
    }

    [Fact]
    public async Task UpdateBatchAsync_ReplacesOldStocks()
    {
        using var ctx = CreateContext();
        var service = new StockService(new StockRepository(ctx));

        var firstBatch = new BulkStockRequestDto
        {
            Items = [new StockItemDto { ProductoId = 1, ProductoNombre = "Cerveza", Stock = 15 }]
        };
        await service.UpdateBatchAsync(1, firstBatch);

        var secondBatch = new BulkStockRequestDto
        {
            Items = [new StockItemDto { ProductoId = 1, ProductoNombre = "Cerveza", Stock = 20 }]
        };
        await service.UpdateBatchAsync(1, secondBatch);

        var result = await service.GetByEventoAsync(1);

        Assert.Single(result);
        Assert.Equal(20, result[0].Stock);
    }
}
