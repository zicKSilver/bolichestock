namespace BolicheStock.Tests.Integration;

public class EventoFlujoCompletoTests : IntegrationTestBase
{
    public EventoFlujoCompletoTests(IntegrationTestFactory factory) : base(factory) { }

    [Fact]
    public async Task AbrirEvento_CrearTicketeras_CerrarCaja_CalculaCierreCorrectamente()
    {
        // Arrange: crear productos
        var cerveza = await CreateProductoAsync("Cerveza", 5);
        var fichas = await CreateProductoAsync("Fichas", 2);

        // Act 1: abrir evento
        var evento = await CreateEventoAsync(new DateTime(2026, 6, 22));
        Assert.Equal("Abierto", evento.Estado);
        Assert.Equal(0, evento.TotalVendido);
        Assert.Equal(0, evento.TotalTickets);

        // Act 2: crear ticketeras
        var rolloCerveza = await CreateTicketRolloAsync(evento.Id, cerveza.Id, 1, 250);
        Assert.Equal(1, rolloCerveza.NumeroInicial);
        Assert.False(rolloCerveza.Completada);

        var rolloFichas = await CreateTicketRolloAsync(evento.Id, fichas.Id, 1, 200);

        // Act 3: completar ticketeras (establecer numeroFinal y completada = true)
        await UpdateTicketRolloAsync(evento.Id, rolloCerveza.Id,
            new()
            {
                ProductoId = cerveza.Id,
                NumeroInicial = 1,
                NumeroFinal = 50,
                TotalTicketera = 250,
                Completada = true,
            });

        await UpdateTicketRolloAsync(evento.Id, rolloFichas.Id,
            new()
            {
                ProductoId = fichas.Id,
                NumeroInicial = 1,
                NumeroFinal = 30,
                TotalTicketera = 200,
                Completada = true,
            });

        // Act 4: definir stock
        await UpdateStocksAsync(evento.Id,
        [
            new() { ProductoId = cerveza.Id, ProductoNombre = "Cerveza", Stock = 50, SinStockNecesario = false },
            new() { ProductoId = fichas.Id, ProductoNombre = "Fichas", Stock = 30, SinStockNecesario = false },
        ]);

        // Act 5: cerrar evento con efectivo y descuento
        var eventoCerrado = await CerrarEventoAsync(evento.Id, efectivoEnCaja: 280, descuentoManual: 20);
        Assert.Equal("Cerrado", eventoCerrado.Estado);
        // Cerveza: 50 tickets * $5 = $250, Fichas: 30 tickets * $2 = $60 → $310 total vendido

        // Assert: verificar cierre
        var cierre = await GetCierreAsync(evento.Id);
        Assert.Equal(310, cierre.TotalVendido);        // 50*5 + 30*2
        Assert.Equal(280, cierre.EfectivoEnCaja);
        Assert.Equal(20, cierre.DescuentoManual);
        Assert.Equal(-10, cierre.Diferencia);           // 280 + 20 - 310
    }
}
