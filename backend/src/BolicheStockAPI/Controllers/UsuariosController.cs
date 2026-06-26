using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BolicheStockAPI.DTOs;
using BolicheStockAPI.Services;

namespace BolicheStockAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsuariosController : ControllerBase
{
    private readonly IUsuarioService _usuarioService;

    public UsuariosController(IUsuarioService usuarioService)
    {
        _usuarioService = usuarioService;
    }

    [HttpGet]
    public async Task<ActionResult> GetAll()
    {
        var usuarios = await _usuarioService.GetAllAsync();
        return Ok(usuarios.Select(u => new { u.Id, u.NombreUsuario, u.IsAdmin }));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetById(int id)
    {
        var usuario = await _usuarioService.GetByIdAsync(id);
        if (usuario is null)
            return NotFound(new { message = $"Usuario con ID {id} no encontrado" });

        return Ok(new { usuario.Id, usuario.NombreUsuario, usuario.IsAdmin });
    }

    [HttpPost]
    public async Task<ActionResult> Create(CrearUsuarioRequestDto dto)
    {
        var created = await _usuarioService.CreateAsync(dto);
        if (created is null)
            return BadRequest(new { message = "El nombre de usuario ya existe" });

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, new { created.Id, created.NombreUsuario, created.IsAdmin });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var deleted = await _usuarioService.DeleteAsync(id);
        if (!deleted)
            return NotFound(new { message = $"Usuario con ID {id} no encontrado" });

        return NoContent();
    }

    [HttpPut("{id}/admin")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult> SetAdmin(int id, [FromBody] SetAdminRequestDto dto)
    {
        var updated = await _usuarioService.SetAdminAsync(id, dto.IsAdmin);
        if (!updated)
            return NotFound(new { message = $"Usuario con ID {id} no encontrado" });

        return NoContent();
    }
}
