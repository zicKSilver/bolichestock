using Microsoft.EntityFrameworkCore;
using BolicheStockAPI.Data;
using BolicheStockAPI.Models;
using BolicheStockAPI.Repositories;

namespace BolicheStock.Tests;

public class EventoRepositoryTests
{
    private static DbContextOptions<AppDbContext> CreateOptions(string name)
    {
        return new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(name)
            .Options;
    }

    [Fact]
    public async Task GetAllAsync_ReturnsEventosOrderedByFechaDesc()
    {
        using var ctx = new AppDbContext(CreateOptions(Guid.NewGuid().ToString()));
        ctx.Eventos.AddRange(
            new Evento { Id = 1, Fecha = new DateTime(2026, 6, 1), Estado = EventoEstado.Cerrado, ProductoEventoTickets = [] },
            new Evento { Id = 2, Fecha = new DateTime(2026, 6, 15), Estado = EventoEstado.Abierto, ProductoEventoTickets = [] },
            new Evento { Id = 3, Fecha = new DateTime(2026, 6, 10), Estado = EventoEstado.Cerrado, ProductoEventoTickets = [] }
        );
        ctx.SaveChanges();

        var repo = new EventoRepository(ctx);
        var result = await repo.GetAllAsync();

        Assert.Equal(3, result.Count);
        Assert.Equal(2, result[0].Id);
        Assert.Equal(3, result[1].Id);
        Assert.Equal(1, result[2].Id);
    }

    [Fact]
    public async Task GetAllAsync_IncludesProductoEventoTickets()
    {
        using var ctx = new AppDbContext(CreateOptions(Guid.NewGuid().ToString()));
        var p = new Producto { Id = 1, Nombre = "Cerveza", Precio = 5 };
        ctx.Productos.Add(p);
        ctx.Eventos.Add(new Evento
        {
            Id = 1,
            Fecha = new DateTime(2026, 6, 1),
            Estado = EventoEstado.Abierto,
            ProductoEventoTickets =
            [
                new() { Producto = p, NumeroInicial = 1, NumeroFinal = 10, Completada = false, ProductoId = 1 }
            ]
        });
        ctx.SaveChanges();

        var repo = new EventoRepository(ctx);
        var result = await repo.GetAllAsync();

        Assert.Single(result);
        Assert.Single(result[0].ProductoEventoTickets);
        Assert.Equal("Cerveza", result[0].ProductoEventoTickets[0].Producto!.Nombre);
    }

    [Fact]
    public async Task GetPagedAsync_ReturnsPagedResults()
    {
        using var ctx = new AppDbContext(CreateOptions(Guid.NewGuid().ToString()));
        for (int i = 1; i <= 5; i++)
        {
            ctx.Eventos.Add(new Evento { Id = i, Fecha = new DateTime(2026, 6, i), Estado = EventoEstado.Abierto, ProductoEventoTickets = [] });
        }
        ctx.SaveChanges();

        var repo = new EventoRepository(ctx);
        var result = await repo.GetPagedAsync(1, 2);

        Assert.Equal(2, result.Items.Count);
        Assert.Equal(5, result.TotalCount);
        Assert.Equal(1, result.Page);
        Assert.Equal(2, result.PageSize);
        Assert.Equal(5, result.Items[0].Id);
    }

    [Fact]
    public async Task GetPagedAsync_ReturnsSecondPage()
    {
        using var ctx = new AppDbContext(CreateOptions(Guid.NewGuid().ToString()));
        for (int i = 1; i <= 5; i++)
        {
            ctx.Eventos.Add(new Evento { Id = i, Fecha = new DateTime(2026, 6, i), Estado = EventoEstado.Abierto, ProductoEventoTickets = [] });
        }
        ctx.SaveChanges();

        var repo = new EventoRepository(ctx);
        var result = await repo.GetPagedAsync(2, 2);

        Assert.Equal(2, result.Items.Count);
        Assert.Equal(3, result.Items[0].Id);
    }

    [Fact]
    public async Task GetWithProductoEventoTicketsAsync_ReturnsEvento_WhenExists()
    {
        using var ctx = new AppDbContext(CreateOptions(Guid.NewGuid().ToString()));
        ctx.Eventos.Add(new Evento
        {
            Id = 1,
            Fecha = new DateTime(2026, 6, 1),
            Estado = EventoEstado.Abierto,
            ProductoEventoTickets = []
        });
        ctx.SaveChanges();

        var repo = new EventoRepository(ctx);
        var result = await repo.GetWithProductoEventoTicketsAsync(1);

        Assert.NotNull(result);
        Assert.Equal(1, result!.Id);
    }

    [Fact]
    public async Task GetWithProductoEventoTicketsAsync_ReturnsNull_WhenNotExists()
    {
        using var ctx = new AppDbContext(CreateOptions(Guid.NewGuid().ToString()));
        var repo = new EventoRepository(ctx);
        var result = await repo.GetWithProductoEventoTicketsAsync(99);

        Assert.Null(result);
    }

    [Fact]
    public async Task AddAsync_PersistsEvento()
    {
        var dbName = Guid.NewGuid().ToString();
        using var ctx = new AppDbContext(CreateOptions(dbName));
        var evento = new Evento
        {
            Fecha = new DateTime(2026, 6, 1),
            Estado = EventoEstado.Abierto,
            ProductoEventoTickets = []
        };

        var repo = new EventoRepository(ctx);
        var result = await repo.AddAsync(evento);

        Assert.NotEqual(0, result.Id);

        using var ctx2 = new AppDbContext(CreateOptions(dbName));
        Assert.Equal(1, await ctx2.Eventos.CountAsync());
    }

    [Fact]
    public async Task UpdateAsync_UpdatesEvento()
    {
        var dbName = Guid.NewGuid().ToString();
        using var ctx = new AppDbContext(CreateOptions(dbName));
        ctx.Eventos.Add(new Evento
        {
            Id = 1,
            Fecha = new DateTime(2026, 6, 1),
            Estado = EventoEstado.Abierto,
            ProductoEventoTickets = []
        });
        ctx.SaveChanges();

        var repo = new EventoRepository(ctx);
        var loaded = (await repo.GetWithProductoEventoTicketsAsync(1))!;
        loaded.Estado = EventoEstado.Cerrado;
        await repo.UpdateAsync(loaded);

        using var ctx2 = new AppDbContext(CreateOptions(dbName));
        var updated = await ctx2.Eventos.FirstAsync();
        Assert.Equal(EventoEstado.Cerrado, updated.Estado);
    }
}
