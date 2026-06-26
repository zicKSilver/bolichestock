using Microsoft.EntityFrameworkCore;
using BolicheStockAPI.Data;
using BolicheStockAPI.Models;
using BolicheStockAPI.Repositories;
using BolicheStockAPI.Services;

namespace BolicheStock.Tests;

public class ReporteServiceTests
{
    private static DbContextOptions<AppDbContext> CreateOptions(string name)
    {
        return new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(name)
            .Options;
    }

    private AppDbContext CreateContext()
    {
        var ctx = new AppDbContext(CreateOptions(Guid.NewGuid().ToString()));

        var cerveza = new Producto { Id = 1, Nombre = "Cerveza", Precio = 5 };
        var pizza = new Producto { Id = 2, Nombre = "Pizza", Precio = 10 };

        ctx.Productos.AddRange(cerveza, pizza);
        ctx.Eventos.AddRange(
            new Evento
            {
                Id = 1,
                Fecha = new DateTime(2026, 6, 1),
                Estado = EventoEstado.Abierto,
                ProductoEventoTickets =
                [
                    new() { Producto = cerveza, NumeroInicial = 1, NumeroFinal = 10, ProductoId = 1, Completada = true },
                    new() { Producto = cerveza, NumeroInicial = 11, NumeroFinal = 15, ProductoId = 1, Completada = true },
                ]
            },
            new Evento
            {
                Id = 2,
                Fecha = new DateTime(2026, 6, 2),
                Estado = EventoEstado.Abierto,
                ProductoEventoTickets =
                [
                    new() { Producto = pizza, NumeroInicial = 1, NumeroFinal = 3, ProductoId = 2, Completada = true },
                ]
            }
        );
        ctx.SaveChanges();

        return ctx;
    }

    [Fact]
    public async Task GetByFechaRangeAsync_ReturnsGroupedReport()
    {
        using var ctx = CreateContext();
        var service = new ReporteService(new ReporteRepository(ctx));

        var result = await service.GetByFechaRangeAsync(new DateTime(2026, 6, 1), new DateTime(2026, 6, 30));

        Assert.Equal(2, result.Items.Count);

        var cerveza = result.Items[0];
        Assert.Equal("Cerveza", cerveza.Producto);
        Assert.Equal(15, cerveza.CantidadTotal);
        Assert.Equal(75, cerveza.TotalVendido);

        var pizza = result.Items[1];
        Assert.Equal("Pizza", pizza.Producto);
        Assert.Equal(3, pizza.CantidadTotal);
        Assert.Equal(30, pizza.TotalVendido);
    }

    [Fact]
    public async Task GetByFechaRangeAsync_WithProductoId_FiltersByProduct()
    {
        using var ctx = CreateContext();
        var service = new ReporteService(new ReporteRepository(ctx));

        var result = await service.GetByFechaRangeAsync(
            new DateTime(2026, 6, 1), new DateTime(2026, 6, 30), 1);

        Assert.Single(result.Items);
        Assert.Equal("Cerveza", result.Items[0].Producto);
    }

    [Fact]
    public async Task GetByFechaRangeAsync_ReturnsEmpty_WhenNoTickets()
    {
        using var ctx = CreateContext();
        var service = new ReporteService(new ReporteRepository(ctx));

        var result = await service.GetByFechaRangeAsync(
            new DateTime(2025, 1, 1), new DateTime(2025, 1, 31));

        Assert.Empty(result.Items);
    }

    [Fact]
    public async Task GetByFechaRangeAsync_OrdersByTotalVendidoDescending()
    {
        using var ctx = new AppDbContext(CreateOptions(Guid.NewGuid().ToString()));
        var barato = new Producto { Id = 1, Nombre = "Barato", Precio = 1 };
        var caro = new Producto { Id = 2, Nombre = "Caro", Precio = 100 };
        ctx.Productos.AddRange(barato, caro);
        ctx.Eventos.Add(
            new Evento
            {
                Id = 1,
                Fecha = new DateTime(2026, 6, 3),
                Estado = EventoEstado.Abierto,
                ProductoEventoTickets =
                [
                    new() { Producto = barato, NumeroInicial = 1, NumeroFinal = 3, ProductoId = 1, Completada = true },
                    new() { Producto = caro, NumeroInicial = 1, NumeroFinal = 2, ProductoId = 2, Completada = true },
                ]
            }
        );
        ctx.SaveChanges();
        var service = new ReporteService(new ReporteRepository(ctx));

        var result = await service.GetByFechaRangeAsync(DateTime.MinValue, new DateTime(2099, 12, 31));

        Assert.Equal("Caro", result.Items[0].Producto);
        Assert.Equal("Barato", result.Items[1].Producto);
    }

    [Fact]
    public async Task GetByFechaRangeAsync_ReturnsDescuentoManualTotal()
    {
        using var ctx = new AppDbContext(CreateOptions(Guid.NewGuid().ToString()));
        var vip = new Producto { Id = 1, Nombre = "VIP", Precio = 100 };
        var normal = new Producto { Id = 2, Nombre = "Normal", Precio = 50 };
        ctx.Productos.AddRange(vip, normal);
        ctx.Eventos.Add(
            new Evento
            {
                Id = 1,
                Fecha = new DateTime(2026, 6, 10),
                Estado = EventoEstado.Cerrado,
                ProductoEventoTickets =
                [
                    new() { Producto = vip, NumeroInicial = 1, NumeroFinal = 2, ProductoId = 1, Completada = true },
                    new() { Producto = normal, NumeroInicial = 1, NumeroFinal = 1, ProductoId = 2, Completada = true },
                ],
                CierreCaja = new CierreCaja { TotalVendido = 250, EfectivoEnCaja = 200, DescuentoManual = 50, Diferencia = 0, FechaHoraCierre = DateTime.UtcNow }
            }
        );
        ctx.SaveChanges();
        var service = new ReporteService(new ReporteRepository(ctx));

        var result = await service.GetByFechaRangeAsync(new DateTime(2026, 6, 1), new DateTime(2026, 6, 30));

        Assert.Equal(2, result.Items.Count);
        Assert.Equal(50, result.DescuentoManual);
        Assert.Equal(250, result.TotalBruto);
        Assert.Equal(200, result.TotalNeto);

        var vipResult = result.Items.First(r => r.Producto == "VIP");
        Assert.Equal(200, vipResult.TotalVendido);

        var normalResult = result.Items.First(r => r.Producto == "Normal");
        Assert.Equal(50, normalResult.TotalVendido);
    }

    [Fact]
    public async Task GetByFechaRangeAsync_WithoutCompletada_NoSumaUno()
    {
        using var ctx = new AppDbContext(CreateOptions(Guid.NewGuid().ToString()));
        var p = new Producto { Id = 1, Nombre = "Test", Precio = 10 };
        ctx.Productos.Add(p);
        ctx.Eventos.Add(
            new Evento
            {
                Id = 1,
                Fecha = new DateTime(2026, 6, 5),
                Estado = EventoEstado.Abierto,
                ProductoEventoTickets =
                [
                    new() { Producto = p, NumeroInicial = 1, NumeroFinal = 3, ProductoId = 1 },
                ]
            }
        );
        ctx.SaveChanges();
        var service = new ReporteService(new ReporteRepository(ctx));

        var result = await service.GetByFechaRangeAsync(new DateTime(2026, 6, 1), new DateTime(2026, 6, 30));

        Assert.Single(result.Items);
        Assert.Equal(2, result.Items[0].CantidadTotal);
        Assert.Equal(20, result.Items[0].TotalVendido);
    }

    [Fact]
    public async Task GetByFechaRangeAsync_SumaDescuentosDeDistintosEventos()
    {
        using var ctx = new AppDbContext(CreateOptions(Guid.NewGuid().ToString()));
        var p = new Producto { Id = 1, Nombre = "Test", Precio = 10 };
        ctx.Productos.Add(p);
        ctx.Eventos.AddRange(
            new Evento
            {
                Id = 1,
                Fecha = new DateTime(2026, 6, 1),
                Estado = EventoEstado.Cerrado,
                ProductoEventoTickets =
                [
                    new() { Producto = p, NumeroInicial = 1, NumeroFinal = 1, ProductoId = 1, Completada = true },
                ],
                CierreCaja = new CierreCaja { TotalVendido = 10, EfectivoEnCaja = 0, DescuentoManual = 50, Diferencia = 0, FechaHoraCierre = DateTime.UtcNow }
            },
            new Evento
            {
                Id = 2,
                Fecha = new DateTime(2026, 6, 2),
                Estado = EventoEstado.Cerrado,
                ProductoEventoTickets =
                [
                    new() { Producto = p, NumeroInicial = 1, NumeroFinal = 1, ProductoId = 1, Completada = true },
                ],
                CierreCaja = new CierreCaja { TotalVendido = 10, EfectivoEnCaja = 0, DescuentoManual = 50, Diferencia = 0, FechaHoraCierre = DateTime.UtcNow }
            }
        );
        ctx.SaveChanges();
        var service = new ReporteService(new ReporteRepository(ctx));

        var result = await service.GetByFechaRangeAsync(new DateTime(2026, 6, 1), new DateTime(2026, 6, 30));

        Assert.Equal(100, result.DescuentoManual);
    }
}
