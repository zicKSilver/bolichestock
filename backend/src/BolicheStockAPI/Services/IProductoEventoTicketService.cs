using BolicheStockAPI.Common;
using BolicheStockAPI.DTOs;

namespace BolicheStockAPI.Services;

public interface IProductoEventoTicketService
{
    Task<List<ProductoEventoTicketResponseDto>> GetByEventoAsync(int eventoId);
    Task<PagedResult<ProductoEventoTicketResponseDto>> GetPagedByEventoAsync(int eventoId, int page, int pageSize);
    Task<ProductoEventoTicketResponseDto?> CrearAsync(int eventoId, ProductoEventoTicketRequestDto dto);
    Task<ProductoEventoTicketResponseDto?> ActualizarAsync(int id, int? numeroInicial, int? numeroFinal, bool? completada, bool limpiarNumeroFinal = false);
    Task<bool> EliminarAsync(int id);
}
