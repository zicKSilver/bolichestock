using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BolicheStockAPI.Common;
using BolicheStockAPI.DTOs;
using BolicheStockAPI.Services;

namespace BolicheStockAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EventosController : ControllerBase
{
    private readonly IEventoService _eventoService;

    public EventosController(IEventoService eventoService)
    {
        _eventoService = eventoService;
    }

    [HttpGet]
    public async Task<ActionResult> GetAll(
        [FromQuery] int? page,
        [FromQuery] int pageSize = 20)
    {
        if (page.HasValue)
        {
            var paged = await _eventoService.GetPagedAsync(page.Value, pageSize);
            return Ok(paged);
        }

        var eventos = await _eventoService.GetAllAsync();
        return Ok(eventos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EventoResponseDto>> GetById(int id)
    {
        var evento = await _eventoService.GetByIdAsync(id);
        if (evento is null)
            return NotFound(new { message = $"Evento con ID {id} no encontrado" });

        return Ok(evento);
    }

    [HttpPost]
    public async Task<ActionResult<EventoResponseDto>> Abrir(EventoRequestDto dto)
    {
        var evento = await _eventoService.AbrirAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = evento.Id }, evento);
    }

    [HttpPut("{id}/cerrar")]
    public async Task<ActionResult<EventoResponseDto>> Cerrar(int id, EventoCerrarRequestDto dto)
    {
        var evento = await _eventoService.CerrarAsync(id, dto);
        if (evento is null)
            return NotFound(new { message = $"Evento con ID {id} no encontrado o ya está cerrado" });

        return Ok(evento);
    }

    [HttpPut("{id}/desactivar")]
    public async Task<ActionResult<EventoResponseDto>> Desactivar(int id)
    {
        var evento = await _eventoService.DesactivarAsync(id);
        if (evento is null)
            return NotFound(new { message = $"Evento con ID {id} no encontrado o ya está cerrado" });

        return Ok(evento);
    }

    [HttpGet("cierres")]
    public async Task<ActionResult<PagedResult<CierreListadoDto>>> GetCierresPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _eventoService.GetCierresPagedAsync(page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id}/cierre")]
    public async Task<ActionResult<CierreCajaResponseDto>> GetCierre(int id)
    {
        var cierre = await _eventoService.GetCierreAsync(id);
        if (cierre is null)
            return NotFound(new { message = $"No hay cierre para el evento con ID {id}" });

        return Ok(cierre);
    }

    [HttpDelete("{id}/cierre")]
    public async Task<ActionResult> DeleteCierre(int id)
    {
        var deleted = await _eventoService.DeleteCierreAsync(id);
        if (!deleted)
            return NotFound(new { message = $"No hay cierre para el evento con ID {id}" });

        return NoContent();
    }
}
