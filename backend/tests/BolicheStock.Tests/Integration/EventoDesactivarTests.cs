namespace BolicheStock.Tests.Integration;

public class EventoDesactivarTests : IntegrationTestBase
{
    public EventoDesactivarTests(IntegrationTestFactory factory) : base(factory) { }

    [Fact]
    public async Task DesactivarEvento_SinVentas_CierraEventoSinCierre()
    {
        // Arrange: crear evento
        var evento = await CreateEventoAsync(new DateTime(2026, 6, 22));
        Assert.Equal("Abierto", evento.Estado);

        // Act: desactivar
        var desactivado = await DesactivarEventoAsync(evento.Id);
        Assert.Equal("Cerrado", desactivado.Estado);

        // Assert: no hay cierre
        var response = await Client.GetAsync($"/api/Eventos/{evento.Id}/cierre");
        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);

        // Assert: estado persiste al consultar evento
        var consultado = await GetEventoAsync(evento.Id);
        Assert.Equal("Cerrado", consultado.Estado);
    }

    [Fact]
    public async Task DesactivarEvento_ConTicketerasSinCompletar_CierraSinCierre()
    {
        // Arrange
        var producto = await CreateProductoAsync("Cerveza", 5);
        var evento = await CreateEventoAsync(new DateTime(2026, 6, 22));
        await CreateTicketRolloAsync(evento.Id, producto.Id, 1, 250);

        // Act: desactivar (no se completaron ticketeras, no hay ventas)
        var desactivado = await DesactivarEventoAsync(evento.Id);
        Assert.Equal("Cerrado", desactivado.Estado);

        // Assert: no hay cierre (desactivar no crea cierre)
        var response = await Client.GetAsync($"/api/Eventos/{evento.Id}/cierre");
        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
    }
}
