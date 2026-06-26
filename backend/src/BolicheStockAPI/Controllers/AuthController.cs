using Microsoft.AspNetCore.Mvc;
using BolicheStockAPI.DTOs;
using BolicheStockAPI.Services;

namespace BolicheStockAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login(LoginRequestDto dto)
    {
        var result = await _authService.LoginAsync(dto);
        if (result is null)
            return Unauthorized(new { message = "Usuario o contraseña incorrectos" });

        return Ok(result);
    }
}
