using BolicheStockAPI.DTOs;
using BolicheStockAPI.Models;
using BolicheStockAPI.Repositories;
using BolicheStockAPI.Services;
using Moq;

namespace BolicheStock.Tests;

public class ProductoEventoTicketServiceTests
{
    private readonly Mock<IProductoEventoTicketRepository> _repo = new();
    private readonly Mock<IEventoRepository> _eventoRepo = new();
    private readonly Mock<IProductoRepository> _productoRepo = new();
    private readonly ProductoEventoTicketService _service;

    public ProductoEventoTicketServiceTests()
    {
        _service = new ProductoEventoTicketService(
            _repo.Object, _eventoRepo.Object, _productoRepo.Object);
    }

    [Fact]
    public async Task GetByEventoAsync_ReturnsRollosForEvento()
    {
        var rollos = new List<ProductoEventoTicket>
        {
            new()
            {
                Id = 1, EventoId = 1, ProductoId = 1,
                NumeroInicial = 1, NumeroFinal = 10, Completada = true,
                Producto = new Producto { Nombre = "Cerveza", Precio = 5 }
            }
        };
        _repo.Setup(r => r.GetByEventoIdAsync(1)).ReturnsAsync(rollos);

        var result = await _service.GetByEventoAsync(1);

        Assert.Single(result);
        Assert.Equal("Cerveza", result[0].ProductoNombre);
        Assert.Equal(10, result[0].TicketsCalculados);
        Assert.Equal(50, result[0].Subtotal);
    }

    [Fact]
    public async Task CrearAsync_CreatesRollo_WhenEventoAbierto()
    {
        var evento = new Evento { Id = 1, Estado = EventoEstado.Abierto, ProductoEventoTickets = [] };
        var producto = new Producto { Id = 1, Nombre = "Cerveza", Precio = 5 };
        var dto = new ProductoEventoTicketRequestDto { ProductoId = 1, NumeroInicial = 1 };

        _eventoRepo.Setup(r => r.GetWithProductoEventoTicketsAsync(1)).ReturnsAsync(evento);
        _productoRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(producto);
        _repo.Setup(r => r.AddAsync(It.IsAny<ProductoEventoTicket>()))
            .ReturnsAsync((ProductoEventoTicket r) =>
            {
                r.Id = 1;
                r.Producto = producto;
                return r;
            });

        var result = await _service.CrearAsync(1, dto);

        Assert.NotNull(result);
        Assert.Equal(1, result!.NumeroInicial);
        Assert.Equal("Cerveza", result.ProductoNombre);
    }

    [Fact]
    public async Task CrearAsync_ReturnsNull_WhenEventoCerrado()
    {
        var evento = new Evento { Id = 1, Estado = EventoEstado.Cerrado, ProductoEventoTickets = [] };
        _eventoRepo.Setup(r => r.GetWithProductoEventoTicketsAsync(1)).ReturnsAsync(evento);

        var result = await _service.CrearAsync(1, new ProductoEventoTicketRequestDto());

        Assert.Null(result);
    }

    [Fact]
    public async Task CrearAsync_ReturnsNull_WhenEventoNotFound()
    {
        _eventoRepo.Setup(r => r.GetWithProductoEventoTicketsAsync(99)).ReturnsAsync((Evento?)null);

        var result = await _service.CrearAsync(99, new ProductoEventoTicketRequestDto());

        Assert.Null(result);
    }

    [Fact]
    public async Task CrearAsync_ReturnsNull_WhenProductoNotFound()
    {
        var evento = new Evento { Id = 1, Estado = EventoEstado.Abierto, ProductoEventoTickets = [] };
        _eventoRepo.Setup(r => r.GetWithProductoEventoTicketsAsync(1)).ReturnsAsync(evento);
        _productoRepo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Producto?)null);

        var result = await _service.CrearAsync(1, new ProductoEventoTicketRequestDto { ProductoId = 99 });

        Assert.Null(result);
    }

    [Fact]
    public async Task ActualizarAsync_UpdatesNumeroFinal()
    {
        var rollo = new ProductoEventoTicket
        {
            Id = 1, EventoId = 1, ProductoId = 1,
            NumeroInicial = 1, NumeroFinal = null
        };
        _repo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(rollo);
        _repo.Setup(r => r.UpdateAsync(It.IsAny<ProductoEventoTicket>()))
            .ReturnsAsync((ProductoEventoTicket r) =>
            {
                r.Producto = new Producto { Nombre = "Cerveza", Precio = 5 };
                return r;
            });

        var result = await _service.ActualizarAsync(1, null, 10, true);

        Assert.NotNull(result);
        Assert.Equal(10, result!.NumeroFinal);
        Assert.Equal(10, result.TicketsCalculados);
    }

    [Fact]
    public async Task ActualizarAsync_SinCompletada_NoSumaUno()
    {
        var rollo = new ProductoEventoTicket
        {
            Id = 1, EventoId = 1, ProductoId = 1,
            NumeroInicial = 1, NumeroFinal = null
        };
        _repo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(rollo);
        _repo.Setup(r => r.UpdateAsync(It.IsAny<ProductoEventoTicket>()))
            .ReturnsAsync((ProductoEventoTicket r) =>
            {
                r.Producto = new Producto { Nombre = "Cerveza", Precio = 5 };
                return r;
            });

        var result = await _service.ActualizarAsync(1, null, 10, false);

        Assert.NotNull(result);
        Assert.Equal(10, result!.NumeroFinal);
        Assert.Equal(9, result.TicketsCalculados);
        Assert.Equal(45, result.Subtotal);
    }

    [Fact]
    public async Task ActualizarAsync_UpdatesNumeroInicial()
    {
        var rollo = new ProductoEventoTicket
        {
            Id = 1, EventoId = 1, ProductoId = 1,
            NumeroInicial = 5, NumeroFinal = 10, Completada = true
        };
        _repo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(rollo);
        _repo.Setup(r => r.UpdateAsync(It.IsAny<ProductoEventoTicket>()))
            .ReturnsAsync((ProductoEventoTicket r) =>
            {
                r.Producto = new Producto { Nombre = "Cerveza", Precio = 5 };
                return r;
            });

        var result = await _service.ActualizarAsync(1, 1, null, true);

        Assert.NotNull(result);
        Assert.Equal(1, result!.NumeroInicial);
        Assert.Equal(10, result.TicketsCalculados);
    }

    [Fact]
    public async Task ActualizarAsync_ReturnsNull_WhenRolloNotFound()
    {
        _repo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((ProductoEventoTicket?)null);

        var result = await _service.ActualizarAsync(99, null, 10, null);

        Assert.Null(result);
    }

    [Fact]
    public async Task CrearAsync_ReturnsNull_WhenNumeroFinalMenorQueInicial()
    {
        var evento = new Evento { Id = 1, Estado = EventoEstado.Abierto, ProductoEventoTickets = [] };
        var producto = new Producto { Id = 1, Nombre = "Cerveza", Precio = 5 };
        var dto = new ProductoEventoTicketRequestDto { ProductoId = 1, NumeroInicial = 10, NumeroFinal = 5 };
        _eventoRepo.Setup(r => r.GetWithProductoEventoTicketsAsync(1)).ReturnsAsync(evento);
        _productoRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(producto);

        var result = await _service.CrearAsync(1, dto);

        Assert.Null(result);
    }

    [Fact]
    public async Task ActualizarAsync_ReturnsNull_WhenNumeroFinalMenorQueInicial()
    {
        var rollo = new ProductoEventoTicket
        {
            Id = 1, EventoId = 1, ProductoId = 1,
            NumeroInicial = 10, NumeroFinal = null, Completada = false
        };
        _repo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(rollo);

        var result = await _service.ActualizarAsync(1, null, 5, null);

        Assert.Null(result);
    }

    [Fact]
    public async Task EliminarAsync_ReturnsTrue_WhenExists()
    {
        _repo.Setup(r => r.DeleteAsync(1)).ReturnsAsync(true);

        var result = await _service.EliminarAsync(1);

        Assert.True(result);
    }

    [Fact]
    public async Task EliminarAsync_ReturnsFalse_WhenNotExists()
    {
        _repo.Setup(r => r.DeleteAsync(99)).ReturnsAsync(false);

        var result = await _service.EliminarAsync(99);

        Assert.False(result);
    }
}
