namespace BolicheStock.Tests.Integration;

[Collection("IntegrationTests")]
public class StockUpsertTests : IntegrationTestBase
{
    public StockUpsertTests(IntegrationTestFactory factory) : base(factory) { }

    [Fact]
    public async Task DefinirStock_Consultar_Reemplazar_VerificaCorrectamente()
    {
        // Arrange: crear productos y evento
        var cerveza = await CreateProductoAsync("Cerveza", 5);
        var fichas = await CreateProductoAsync("Fichas", 2);
        var evento = await CreateEventoAsync(new DateTime(2026, 6, 22));

        // Act 1: definir stock inicial
        await UpdateStocksAsync(evento.Id,
        [
            new() { ProductoId = cerveza.Id, ProductoNombre = "Cerveza", Stock = 10, SinStockNecesario = false },
            new() { ProductoId = fichas.Id, ProductoNombre = "Fichas", Stock = 20, SinStockNecesario = false },
        ]);

        // Assert 1: consultar — ambos productos
        var stocks = await GetStocksAsync(evento.Id);
        Assert.Equal(2, stocks.Count);

        var cervezaStock = stocks.Single(s => s.ProductoId == cerveza.Id);
        Assert.Equal(10, cervezaStock.Stock);
        Assert.False(cervezaStock.SinStockNecesario);

        var fichasStock = stocks.Single(s => s.ProductoId == fichas.Id);
        Assert.Equal(20, fichasStock.Stock);

        // Act 2: reemplazar stock (solo cerveza, diferente cantidad)
        await UpdateStocksAsync(evento.Id,
        [
            new() { ProductoId = cerveza.Id, ProductoNombre = "Cerveza", Stock = 15, SinStockNecesario = false },
        ]);

        // Assert 2: consultar — solo cerveza, fichas eliminado
        stocks = await GetStocksAsync(evento.Id);
        Assert.Single(stocks);
        Assert.Equal(15, stocks[0].Stock);
        Assert.Equal("Cerveza", stocks[0].ProductoNombre);
    }

    [Fact]
    public async Task SinStockNecesario_SePersisteCorrectamente()
    {
        // Arrange
        var producto = await CreateProductoAsync("Vasos", 1);
        var evento = await CreateEventoAsync(new DateTime(2026, 6, 22));

        // Act: definir stock con SinStockNecesario = true
        await UpdateStocksAsync(evento.Id,
        [
            new() { ProductoId = producto.Id, ProductoNombre = "Vasos", Stock = 0, SinStockNecesario = true },
        ]);

        // Assert
        var stocks = await GetStocksAsync(evento.Id);
        var vasos = stocks.Single();
        Assert.True(vasos.SinStockNecesario);
        Assert.Equal(0, vasos.Stock);
    }
}
