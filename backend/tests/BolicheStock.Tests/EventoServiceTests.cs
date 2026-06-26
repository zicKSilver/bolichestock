using BolicheStockAPI.Common;
using BolicheStockAPI.DTOs;
using BolicheStockAPI.Models;
using BolicheStockAPI.Repositories;
using BolicheStockAPI.Services;
using Moq;

namespace BolicheStock.Tests;

public class EventoServiceTests
{
    private readonly Mock<IEventoRepository> _eventoRepo = new();
    private readonly Mock<ICierreCajaRepository> _cierreRepo = new();
    private readonly EventoService _service;

    public EventoServiceTests()
    {
        _service = new EventoService(_eventoRepo.Object, _cierreRepo.Object);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllEventos()
    {
        var eventos = new List<Evento>
        {
            new() { Id = 1, Fecha = new DateTime(2026, 6, 1), Estado = EventoEstado.Abierto, ProductoEventoTickets = [] },
            new() { Id = 2, Fecha = new DateTime(2026, 5, 30), Estado = EventoEstado.Cerrado, ProductoEventoTickets = [] }
        };
        _eventoRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(eventos);

        var result = await _service.GetAllAsync();

        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task GetPagedAsync_ReturnsPagedEventos()
    {
        var paged = new PagedResult<Evento>
        {
            Items = [new Evento { Id = 1, Fecha = DateTime.Today, Estado = EventoEstado.Abierto, ProductoEventoTickets = [] }],
            TotalCount = 1,
            Page = 1,
            PageSize = 10
        };
        _eventoRepo.Setup(r => r.GetPagedAsync(1, 10)).ReturnsAsync(paged);

        var result = await _service.GetPagedAsync(1, 10);

        Assert.Single(result.Items);
        Assert.Equal(1, result.TotalCount);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsEvento_WhenExists()
    {
        var evento = new Evento
        {
            Id = 1,
            Fecha = DateTime.Today,
            Estado = EventoEstado.Abierto,
            ProductoEventoTickets = []
        };
        _eventoRepo.Setup(r => r.GetWithProductoEventoTicketsAsync(1)).ReturnsAsync(evento);

        var result = await _service.GetByIdAsync(1);

        Assert.NotNull(result);
        Assert.Equal("Abierto", result!.Estado);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenNotExists()
    {
        _eventoRepo.Setup(r => r.GetWithProductoEventoTicketsAsync(99)).ReturnsAsync((Evento?)null);

        var result = await _service.GetByIdAsync(99);

        Assert.Null(result);
    }

    [Fact]
    public async Task AbrirAsync_CreatesAndReturnsEvento()
    {
        var dto = new EventoRequestDto { Fecha = new DateTime(2026, 6, 16) };
        var created = new Evento { Id = 1, Fecha = dto.Fecha, Estado = EventoEstado.Abierto };
        _eventoRepo.Setup(r => r.AddAsync(It.IsAny<Evento>())).ReturnsAsync(created);

        var result = await _service.AbrirAsync(dto);

        Assert.NotNull(result);
        Assert.Equal("Abierto", result.Estado);
        Assert.Equal(new DateTime(2026, 6, 16), result.Fecha);
    }

    [Fact]
    public async Task CerrarAsync_ReturnsNull_WhenEventoNotFound()
    {
        _eventoRepo.Setup(r => r.GetWithProductoEventoTicketsAsync(99)).ReturnsAsync((Evento?)null);

        var result = await _service.CerrarAsync(99, new EventoCerrarRequestDto());

        Assert.Null(result);
    }

    [Fact]
    public async Task CerrarAsync_ReturnsNull_WhenEventoCerrado()
    {
        var evento = new Evento { Id = 1, Estado = EventoEstado.Cerrado, ProductoEventoTickets = [] };
        _eventoRepo.Setup(r => r.GetWithProductoEventoTicketsAsync(1)).ReturnsAsync(evento);

        var result = await _service.CerrarAsync(1, new EventoCerrarRequestDto());

        Assert.Null(result);
    }

    [Fact]
    public async Task CerrarAsync_IgnoresRolloSinFinal()
    {
        var evento = new Evento
        {
            Id = 1,
            Estado = EventoEstado.Abierto,
            ProductoEventoTickets =
            [
                new() { Producto = new Producto { Precio = 10 }, NumeroInicial = 1, NumeroFinal = 3, Completada = true },
                new() { Producto = new Producto { Precio = 5 }, NumeroInicial = 10, NumeroFinal = null }
            ]
        };
        _eventoRepo.Setup(r => r.GetWithProductoEventoTicketsAsync(1)).ReturnsAsync(evento);
        _cierreRepo.Setup(r => r.AddAsync(It.IsAny<CierreCaja>())).ReturnsAsync((CierreCaja c) => c);
        _eventoRepo.Setup(r => r.UpdateAsync(It.IsAny<Evento>())).ReturnsAsync((Evento e) => e);

        var result = await _service.CerrarAsync(1, new EventoCerrarRequestDto { EfectivoEnCaja = 40 });

        Assert.NotNull(result);
        Assert.Equal("Cerrado", result!.Estado);

        _cierreRepo.Verify(r => r.AddAsync(It.Is<CierreCaja>(c =>
            c.TotalVendido == 30 &&
            c.EfectivoEnCaja == 40 &&
            c.Diferencia == 10
        )), Times.Once);
    }

    [Fact]
    public async Task CerrarAsync_CalculatesCierre_AndClosesEvento()
    {
        var evento = new Evento
        {
            Id = 1,
            Estado = EventoEstado.Abierto,
            ProductoEventoTickets =
            [
                new() { Producto = new Producto { Precio = 10 }, NumeroInicial = 1, NumeroFinal = 3, Completada = true },
                new() { Producto = new Producto { Precio = 5 }, NumeroInicial = 10, NumeroFinal = 10, Completada = true }
            ]
        };
        var dto = new EventoCerrarRequestDto { EfectivoEnCaja = 40 };

        _eventoRepo.Setup(r => r.GetWithProductoEventoTicketsAsync(1)).ReturnsAsync(evento);
        _cierreRepo.Setup(r => r.AddAsync(It.IsAny<CierreCaja>())).ReturnsAsync((CierreCaja c) => c);
        _eventoRepo.Setup(r => r.UpdateAsync(It.IsAny<Evento>())).ReturnsAsync((Evento e) => e);

        var result = await _service.CerrarAsync(1, dto);

        Assert.NotNull(result);
        Assert.Equal("Cerrado", result!.Estado);

        _cierreRepo.Verify(r => r.AddAsync(It.Is<CierreCaja>(c =>
            c.TotalVendido == 35 &&
            c.EfectivoEnCaja == 40 &&
            c.Diferencia == 5
        )), Times.Once);

        _eventoRepo.Verify(r => r.UpdateAsync(It.Is<Evento>(e =>
            e.Estado == EventoEstado.Cerrado
        )), Times.Once);
    }

    [Fact]
    public async Task CerrarAsync_WithoutCompletada_NoSumaUno()
    {
        var evento = new Evento
        {
            Id = 1,
            Estado = EventoEstado.Abierto,
            ProductoEventoTickets =
            [
                new() { Producto = new Producto { Precio = 10 }, NumeroInicial = 1, NumeroFinal = 3 }
            ]
        };
        _eventoRepo.Setup(r => r.GetWithProductoEventoTicketsAsync(1)).ReturnsAsync(evento);
        _cierreRepo.Setup(r => r.AddAsync(It.IsAny<CierreCaja>())).ReturnsAsync((CierreCaja c) => c);
        _eventoRepo.Setup(r => r.UpdateAsync(It.IsAny<Evento>())).ReturnsAsync((Evento e) => e);

        var result = await _service.CerrarAsync(1, new EventoCerrarRequestDto { EfectivoEnCaja = 25 });

        Assert.NotNull(result);
        Assert.Equal("Cerrado", result!.Estado);

        _cierreRepo.Verify(r => r.AddAsync(It.Is<CierreCaja>(c =>
            c.TotalVendido == 20 &&
            c.EfectivoEnCaja == 25 &&
            c.Diferencia == 5
        )), Times.Once);
    }

    [Fact]
    public async Task DesactivarAsync_ClosesEvento_WithoutCierre()
    {
        var evento = new Evento { Id = 1, Estado = EventoEstado.Abierto, ProductoEventoTickets = [] };
        _eventoRepo.Setup(r => r.GetWithProductoEventoTicketsAsync(1)).ReturnsAsync(evento);
        _eventoRepo.Setup(r => r.UpdateAsync(It.IsAny<Evento>())).ReturnsAsync((Evento e) => e);

        var result = await _service.DesactivarAsync(1);

        Assert.NotNull(result);
        Assert.Equal("Cerrado", result!.Estado);
        _eventoRepo.Verify(r => r.UpdateAsync(It.Is<Evento>(e => e.Estado == EventoEstado.Cerrado)), Times.Once);
        _cierreRepo.Verify(r => r.AddAsync(It.IsAny<CierreCaja>()), Times.Never);
    }

    [Fact]
    public async Task DesactivarAsync_ReturnsNull_WhenEventoNotFound()
    {
        _eventoRepo.Setup(r => r.GetWithProductoEventoTicketsAsync(99)).ReturnsAsync((Evento?)null);

        var result = await _service.DesactivarAsync(99);

        Assert.Null(result);
    }

    [Fact]
    public async Task DesactivarAsync_ReturnsNull_WhenEventoCerrado()
    {
        var evento = new Evento { Id = 1, Estado = EventoEstado.Cerrado, ProductoEventoTickets = [] };
        _eventoRepo.Setup(r => r.GetWithProductoEventoTicketsAsync(1)).ReturnsAsync(evento);

        var result = await _service.DesactivarAsync(1);

        Assert.Null(result);
    }

    [Fact]
    public async Task GetCierreAsync_ReturnsCierre_WhenExists()
    {
        var cierre = new CierreCaja
        {
            Id = 1,
            EventoId = 1,
            TotalVendido = 100,
            EfectivoEnCaja = 120,
            Diferencia = 20,
            FechaHoraCierre = new DateTime(2026, 6, 16)
        };
        _cierreRepo.Setup(r => r.GetByEventoIdAsync(1)).ReturnsAsync(cierre);

        var result = await _service.GetCierreAsync(1);

        Assert.NotNull(result);
        Assert.Equal(100, result!.TotalVendido);
        Assert.Equal(20, result.Diferencia);
    }

    [Fact]
    public async Task GetCierreAsync_ReturnsNull_WhenNotExists()
    {
        _cierreRepo.Setup(r => r.GetByEventoIdAsync(99)).ReturnsAsync((CierreCaja?)null);

        var result = await _service.GetCierreAsync(99);

        Assert.Null(result);
    }

    [Fact]
    public async Task CerrarAsync_CalculatesCierre_WithDescuentoManual()
    {
        var evento = new Evento
        {
            Id = 1,
            Estado = EventoEstado.Abierto,
            ProductoEventoTickets =
            [
                new() { Producto = new Producto { Precio = 10 }, NumeroInicial = 1, NumeroFinal = 6, Completada = true },
            ]
        };
        var dto = new EventoCerrarRequestDto { EfectivoEnCaja = 30, DescuentoManual = 20 };

        _eventoRepo.Setup(r => r.GetWithProductoEventoTicketsAsync(1)).ReturnsAsync(evento);
        _cierreRepo.Setup(r => r.AddAsync(It.IsAny<CierreCaja>())).ReturnsAsync((CierreCaja c) => c);
        _eventoRepo.Setup(r => r.UpdateAsync(It.IsAny<Evento>())).ReturnsAsync((Evento e) => e);

        var result = await _service.CerrarAsync(1, dto);

        _cierreRepo.Verify(r => r.AddAsync(It.Is<CierreCaja>(c =>
            c.TotalVendido == 60 &&
            c.EfectivoEnCaja == 30 &&
            c.DescuentoManual == 20 &&
            c.Diferencia == -10
        )), Times.Once);
    }

    [Fact]
    public async Task GetCierresPagedAsync_ReturnsPagedCierres()
    {
        var cierres = new PagedResult<CierreCaja>
        {
            Items =
            [
                new()
                {
                    Id = 1, EventoId = 1,
                    TotalVendido = 100, EfectivoEnCaja = 120, Diferencia = 20,
                    FechaHoraCierre = new DateTime(2026, 6, 16),
                    Evento = new Evento { Fecha = new DateTime(2026, 6, 15), Estado = EventoEstado.Cerrado, ProductoEventoTickets = [] }
                },
                new()
                {
                    Id = 2, EventoId = 2,
                    TotalVendido = 200, EfectivoEnCaja = 180, DescuentoManual = 10, Diferencia = -30,
                    FechaHoraCierre = new DateTime(2026, 6, 17),
                    Evento = new Evento { Fecha = new DateTime(2026, 6, 16), Estado = EventoEstado.Cerrado, ProductoEventoTickets = [] }
                }
            ],
            TotalCount = 2,
            Page = 1,
            PageSize = 10
        };
        _cierreRepo.Setup(r => r.GetPagedAsync(1, 10)).ReturnsAsync(cierres);

        var result = await _service.GetCierresPagedAsync(1, 10);

        Assert.Equal(2, result.Items.Count);
        Assert.Equal(2, result.TotalCount);
        Assert.Equal(1, result.Page);
        Assert.Equal(100, result.Items[0].TotalVendido);
        Assert.Equal(10, result.Items[1].DescuentoManual);
    }

    [Fact]
    public async Task GetCierresPagedAsync_ReturnsEmpty_WhenNoCierres()
    {
        var empty = new PagedResult<CierreCaja>
        {
            Items = [],
            TotalCount = 0,
            Page = 1,
            PageSize = 10
        };
        _cierreRepo.Setup(r => r.GetPagedAsync(1, 10)).ReturnsAsync(empty);

        var result = await _service.GetCierresPagedAsync(1, 10);

        Assert.Empty(result.Items);
        Assert.Equal(0, result.TotalCount);
    }
}
