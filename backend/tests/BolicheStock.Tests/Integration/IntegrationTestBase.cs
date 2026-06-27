using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.DependencyInjection;
using BolicheStockAPI.DTOs;

namespace BolicheStock.Tests.Integration;

public abstract class IntegrationTestBase
{
    protected readonly HttpClient Client;
    protected readonly IntegrationTestFactory Factory;
    protected static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
    };

    protected IntegrationTestBase(IntegrationTestFactory factory)
    {
        Factory = factory;
        Client = factory.CreateClient();

        var token = TestAuthHelper.GenerateToken();
        Client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
    }

    protected async Task<ProductoResponseDto> CreateProductoAsync(string nombre, decimal precio)
    {
        var response = await Client.PostAsJsonAsync("/api/Productos",
            new ProductoRequestDto { Nombre = nombre, Precio = precio });
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<ProductoResponseDto>(json, JsonOptions)!;
    }

    protected async Task<EventoResponseDto> CreateEventoAsync(DateTime fecha)
    {
        var response = await Client.PostAsJsonAsync("/api/Eventos",
            new EventoRequestDto { Fecha = fecha });
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<EventoResponseDto>(json, JsonOptions)!;
    }

    protected async Task<ProductoEventoTicketResponseDto> CreateTicketRolloAsync(
        int eventoId, int productoId, int numeroInicial, int totalTicketera)
    {
        var response = await Client.PostAsJsonAsync(
            $"/api/eventos/{eventoId}/ticket-rollos",
            new ProductoEventoTicketRequestDto
            {
                ProductoId = productoId,
                NumeroInicial = numeroInicial,
                TotalTicketera = totalTicketera,
            });
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<ProductoEventoTicketResponseDto>(json, JsonOptions)!;
    }

    protected async Task<ProductoEventoTicketResponseDto> UpdateTicketRolloAsync(
        int eventoId, int id, ProductoEventoTicketRequestDto dto)
    {
        var response = await Client.PutAsJsonAsync(
            $"/api/eventos/{eventoId}/ticket-rollos/{id}", dto);
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<ProductoEventoTicketResponseDto>(json, JsonOptions)!;
    }

    protected async Task<EventoResponseDto> CerrarEventoAsync(int eventoId,
        decimal efectivoEnCaja, decimal descuentoManual)
    {
        var response = await Client.PutAsJsonAsync($"/api/Eventos/{eventoId}/cerrar",
            new EventoCerrarRequestDto
            {
                EfectivoEnCaja = efectivoEnCaja,
                DescuentoManual = descuentoManual,
            });
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<EventoResponseDto>(json, JsonOptions)!;
    }

    protected async Task<List<StockItemDto>> GetStocksAsync(int eventoId)
    {
        var response = await Client.GetAsync($"/api/eventos/{eventoId}/stocks");
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<List<StockItemDto>>(json, JsonOptions)!;
    }

    protected async Task UpdateStocksAsync(int eventoId, List<StockItemDto> items)
    {
        var response = await Client.PutAsJsonAsync($"/api/eventos/{eventoId}/stocks",
            new BulkStockRequestDto { Items = items });
        response.EnsureSuccessStatusCode();
    }

    protected async Task<EventoResponseDto> GetEventoAsync(int id)
    {
        var response = await Client.GetAsync($"/api/Eventos/{id}");
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<EventoResponseDto>(json, JsonOptions)!;
    }

    protected async Task<CierreCajaResponseDto> GetCierreAsync(int eventoId)
    {
        var response = await Client.GetAsync($"/api/Eventos/{eventoId}/cierre");
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<CierreCajaResponseDto>(json, JsonOptions)!;
    }

    protected async Task<EventoResponseDto> DesactivarEventoAsync(int eventoId)
    {
        var response = await Client.PutAsJsonAsync(
            $"/api/Eventos/{eventoId}/desactivar", new { });
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<EventoResponseDto>(json, JsonOptions)!;
    }
}
