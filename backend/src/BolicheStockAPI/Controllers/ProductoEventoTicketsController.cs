using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BolicheStockAPI.DTOs;
using BolicheStockAPI.Services;

namespace BolicheStockAPI.Controllers;

[ApiController]
[Route("api/eventos/{eventoId}/ticket-rollos")]
[Authorize]
public class ProductoEventoTicketsController : ControllerBase
{
    private readonly IProductoEventoTicketService _service;

    public ProductoEventoTicketsController(IProductoEventoTicketService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult> GetAll(int eventoId, [FromQuery] int? page, [FromQuery] int pageSize = 20)
    {
        if (page.HasValue)
        {
            var paged = await _service.GetPagedByEventoAsync(eventoId, page.Value, pageSize);
            return Ok(paged);
        }
        var rollos = await _service.GetByEventoAsync(eventoId);
        return Ok(rollos);
    }

    [HttpPost]
    public async Task<ActionResult<ProductoEventoTicketResponseDto>> Create(int eventoId, ProductoEventoTicketRequestDto dto)
    {
        var rollo = await _service.CrearAsync(eventoId, dto);
        if (rollo is null)
            return BadRequest(new { message = "No se pudo crear. Verifique evento abierto, producto existente y que el número final no sea menor al inicial" });

        return CreatedAtAction(nameof(GetAll), new { eventoId }, rollo);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ProductoEventoTicketResponseDto>> Update(int eventoId, int id, ProductoEventoTicketRequestDto dto)
    {
        var rollo = await _service.ActualizarAsync(id, dto.NumeroInicial, dto.NumeroFinal, dto.Completada, dto.LimpiarNumeroFinal);
        if (rollo is null)
            return NotFound(new { message = "Rollo no encontrado" });

        return Ok(rollo);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int eventoId, int id)
    {
        var deleted = await _service.EliminarAsync(id);
        if (!deleted)
            return NotFound(new { message = "Rollo no encontrado" });

        return NoContent();
    }
}
