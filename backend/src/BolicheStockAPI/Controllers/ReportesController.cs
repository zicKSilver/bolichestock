using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BolicheStockAPI.DTOs;
using BolicheStockAPI.Services;

namespace BolicheStockAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportesController : ControllerBase
{
    private readonly IReporteService _reporteService;

    public ReportesController(IReporteService reporteService)
    {
        _reporteService = reporteService;
    }

    [HttpGet]
    public async Task<ActionResult<ReporteGeneralResponseDto>> GetReporte(
        [FromQuery] DateTime? desde,
        [FromQuery] DateTime? hasta,
        [FromQuery] int? productoId = null)
    {
        var desdeVal = desde ?? DateTime.Today.AddDays(-30);
        var hastaVal = hasta ?? DateTime.Today;

        if (desdeVal > hastaVal)
            return BadRequest(new { message = "'desde' no puede ser posterior a 'hasta'" });

        var reporte = await _reporteService.GetByFechaRangeAsync(desdeVal, hastaVal, productoId);
        return Ok(reporte);
    }
}
