using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BolicheStockAPI.DTOs;
using BolicheStockAPI.Models;
using BolicheStockAPI.Repositories;
using BolicheStockAPI.Services;
using Microsoft.Extensions.Configuration;
using Moq;

namespace BolicheStock.Tests;

public class AuthServiceTests
{
    private readonly Mock<IUsuarioRepository> _usuarioRepo = new();
    private readonly Mock<IConfiguration> _configuration = new();
    private readonly AuthService _service;

    public AuthServiceTests()
    {
        _configuration.Setup(c => c["Jwt:Key"]).Returns("supersecretkeythatshouldbeatleast32charslong!!");
        _configuration.Setup(c => c["Jwt:Issuer"]).Returns("test-issuer");
        _configuration.Setup(c => c["Jwt:Audience"]).Returns("test-audience");

        _service = new AuthService(_usuarioRepo.Object, _configuration.Object);
    }

    [Fact]
    public async Task LoginAsync_ReturnsToken_WhenCredentialsValid()
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("password123");
        var usuario = new Usuario { Id = 1, NombreUsuario = "admin", PasswordHash = passwordHash };
        _usuarioRepo.Setup(r => r.GetByNombreUsuarioAsync("admin")).ReturnsAsync(usuario);

        var result = await _service.LoginAsync(new LoginRequestDto
        {
            NombreUsuario = "admin",
            Password = "password123"
        });

        Assert.NotNull(result);
        Assert.Equal("admin", result!.NombreUsuario);
        Assert.NotNull(result.Token);

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(result.Token);
        Assert.Equal("test-issuer", jwt.Issuer);
        Assert.Contains(jwt.Claims, c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name" && c.Value == "admin");
    }

    [Fact]
    public async Task LoginAsync_ReturnsNull_WhenUserNotFound()
    {
        _usuarioRepo.Setup(r => r.GetByNombreUsuarioAsync("ghost")).ReturnsAsync((Usuario?)null);

        var result = await _service.LoginAsync(new LoginRequestDto
        {
            NombreUsuario = "ghost",
            Password = "anything"
        });

        Assert.Null(result);
    }

    [Fact]
    public async Task LoginAsync_ReturnsNull_WhenPasswordIncorrect()
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("correctpassword");
        var usuario = new Usuario { Id = 1, NombreUsuario = "admin", PasswordHash = passwordHash };
        _usuarioRepo.Setup(r => r.GetByNombreUsuarioAsync("admin")).ReturnsAsync(usuario);

        var result = await _service.LoginAsync(new LoginRequestDto
        {
            NombreUsuario = "admin",
            Password = "wrongpassword"
        });

        Assert.Null(result);
    }
}
