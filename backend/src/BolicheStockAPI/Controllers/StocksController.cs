using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BolicheStockAPI.DTOs;
using BolicheStockAPI.Services;

namespace BolicheStockAPI.Controllers;

[ApiController]
[Route("api/eventos/{eventoId}/stocks")]
[Authorize]
public class StocksController : ControllerBase
{
    private readonly IStockService _stockService;

    public StocksController(IStockService stockService)
    {
        _stockService = stockService;
    }

    [HttpGet]
    public async Task<ActionResult<List<StockItemDto>>> GetAll(int eventoId)
    {
        var stocks = await _stockService.GetByEventoAsync(eventoId);
        return Ok(stocks);
    }

    [HttpPut]
    public async Task<ActionResult> Update(int eventoId, BulkStockRequestDto dto)
    {
        await _stockService.UpdateBatchAsync(eventoId, dto);
        return NoContent();
    }
}
