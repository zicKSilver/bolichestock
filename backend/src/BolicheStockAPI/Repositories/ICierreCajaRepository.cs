using BolicheStockAPI.Common;
using BolicheStockAPI.Models;

namespace BolicheStockAPI.Repositories;

public interface ICierreCajaRepository
{
    Task<CierreCaja?> GetByEventoIdAsync(int eventoId);
    Task<PagedResult<CierreCaja>> GetPagedAsync(int page, int pageSize);
    Task<CierreCaja> AddAsync(CierreCaja cierre);
    Task<bool> DeleteAsync(CierreCaja cierre);
}
