using BolicheStockAPI.Common;
using BolicheStockAPI.DTOs;

namespace BolicheStockAPI.Services;

public interface IEventoService
{
    Task<List<EventoResponseDto>> GetAllAsync();
    Task<PagedResult<EventoResponseDto>> GetPagedAsync(int page, int pageSize);
    Task<EventoResponseDto?> GetByIdAsync(int id);
    Task<EventoResponseDto> AbrirAsync(EventoRequestDto dto);
    Task<EventoResponseDto?> CerrarAsync(int id, EventoCerrarRequestDto dto);
    Task<EventoResponseDto?> DesactivarAsync(int id);
    Task<PagedResult<CierreListadoDto>> GetCierresPagedAsync(int page, int pageSize);
    Task<CierreCajaResponseDto?> GetCierreAsync(int eventoId);
}
