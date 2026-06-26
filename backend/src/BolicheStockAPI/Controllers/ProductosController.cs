using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BolicheStockAPI.DTOs;
using BolicheStockAPI.Services;

namespace BolicheStockAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductosController : ControllerBase
{
    private readonly IProductoService _productoService;

    public ProductosController(IProductoService productoService)
    {
        _productoService = productoService;
    }

    [HttpGet]
    public async Task<ActionResult> GetAll(
        [FromQuery] int? page,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null)
    {
        if (page.HasValue)
        {
            var paged = await _productoService.GetPagedAsync(page.Value, pageSize, search);
            return Ok(paged);
        }

        var productos = await _productoService.GetAllAsync();
        return Ok(productos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductoResponseDto>> GetById(int id)
    {
        var producto = await _productoService.GetByIdAsync(id);
        if (producto is null)
            return NotFound(new { message = $"Producto con ID {id} no encontrado" });

        return Ok(producto);
    }

    [HttpPost]
    public async Task<ActionResult<ProductoResponseDto>> Create(ProductoRequestDto dto)
    {
        var producto = await _productoService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = producto.Id }, producto);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ProductoResponseDto>> Update(int id, ProductoRequestDto dto)
    {
        var producto = await _productoService.UpdateAsync(id, dto);
        if (producto is null)
            return NotFound(new { message = $"Producto con ID {id} no encontrado" });

        return Ok(producto);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var deleted = await _productoService.DeleteAsync(id);
        if (!deleted)
            return NotFound(new { message = $"Producto con ID {id} no encontrado" });

        return NoContent();
    }
}
