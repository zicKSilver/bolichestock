using BolicheStockAPI.DTOs;
using BolicheStockAPI.Models;
using BolicheStockAPI.Repositories;
using BolicheStockAPI.Services;
using Moq;

namespace BolicheStock.Tests;

public class UsuarioServiceTests
{
    private readonly Mock<IUsuarioRepository> _usuarioRepo = new();
    private readonly UsuarioService _service;

    public UsuarioServiceTests()
    {
        _service = new UsuarioService(_usuarioRepo.Object);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllUsuarios()
    {
        var usuarios = new List<Usuario>
        {
            new() { Id = 1, NombreUsuario = "admin", PasswordHash = "hash" },
            new() { Id = 2, NombreUsuario = "empleado", PasswordHash = "hash" }
        };
        _usuarioRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(usuarios);

        var result = await _service.GetAllAsync();

        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsUsuario_WhenExists()
    {
        var usuario = new Usuario { Id = 1, NombreUsuario = "admin", PasswordHash = "hash" };
        _usuarioRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(usuario);

        var result = await _service.GetByIdAsync(1);

        Assert.NotNull(result);
        Assert.Equal("admin", result!.NombreUsuario);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenNotExists()
    {
        _usuarioRepo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Usuario?)null);

        var result = await _service.GetByIdAsync(99);

        Assert.Null(result);
    }

    [Fact]
    public async Task CreateAsync_CreatesUsuario()
    {
        var dto = new CrearUsuarioRequestDto { NombreUsuario = "nuevo", Password = "password123" };
        _usuarioRepo.Setup(r => r.GetByNombreUsuarioAsync("nuevo")).ReturnsAsync((Usuario?)null);
        _usuarioRepo.Setup(r => r.AddAsync(It.IsAny<Usuario>())).ReturnsAsync((Usuario u) => u);

        var result = await _service.CreateAsync(dto);

        Assert.NotNull(result);
        Assert.Equal("nuevo", result!.NombreUsuario);
        Assert.NotEqual("password123", result.PasswordHash);
        Assert.StartsWith("$2", result.PasswordHash);
    }

    [Fact]
    public async Task CreateAsync_ReturnsNull_WhenDuplicate()
    {
        var existing = new Usuario { Id = 1, NombreUsuario = "admin", PasswordHash = "hash" };
        var dto = new CrearUsuarioRequestDto { NombreUsuario = "admin", Password = "password123" };
        _usuarioRepo.Setup(r => r.GetByNombreUsuarioAsync("admin")).ReturnsAsync(existing);

        var result = await _service.CreateAsync(dto);

        Assert.Null(result);
    }

    [Fact]
    public async Task DeleteAsync_ReturnsTrue_WhenDeleted()
    {
        _usuarioRepo.Setup(r => r.DeleteAsync(1)).ReturnsAsync(true);

        var result = await _service.DeleteAsync(1);

        Assert.True(result);
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFalse_WhenNotExists()
    {
        _usuarioRepo.Setup(r => r.DeleteAsync(99)).ReturnsAsync(false);

        var result = await _service.DeleteAsync(99);

        Assert.False(result);
    }
}
