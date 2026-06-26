using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using BolicheStockAPI.DTOs;
using BolicheStockAPI.Repositories;

namespace BolicheStockAPI.Services;

public class AuthService : IAuthService
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IConfiguration _configuration;

    public AuthService(IUsuarioRepository usuarioRepository, IConfiguration configuration)
    {
        _usuarioRepository = usuarioRepository;
        _configuration = configuration;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto dto)
    {
        var usuario = await _usuarioRepository.GetByNombreUsuarioAsync(dto.NombreUsuario);
        if (usuario is null)
            return null;

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, usuario.PasswordHash))
            return null;

        var token = GenerateToken(usuario);
        return new LoginResponseDto
        {
            Token = token,
            NombreUsuario = usuario.NombreUsuario,
            IsAdmin = usuario.IsAdmin
        };
    }

    private string GenerateToken(Models.Usuario usuario)
    {
        var jwtKey = _configuration["Jwt:Key"]!;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(ClaimTypes.Name, usuario.NombreUsuario),
            new Claim(ClaimTypes.Role, usuario.IsAdmin ? "admin" : "user")
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
