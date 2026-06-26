using BolicheStockAPI.DTOs;
using BolicheStockAPI.Models;
using BolicheStockAPI.Repositories;

namespace BolicheStockAPI.Services;

public class UsuarioService : IUsuarioService
{
    private readonly IUsuarioRepository _repository;

    public UsuarioService(IUsuarioRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<Usuario>> GetAllAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<Usuario?> GetByIdAsync(int id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<Usuario?> CreateAsync(CrearUsuarioRequestDto dto)
    {
        var exists = await _repository.GetByNombreUsuarioAsync(dto.NombreUsuario);
        if (exists is not null)
            return null;

        var usuario = new Usuario
        {
            NombreUsuario = dto.NombreUsuario,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        return await _repository.AddAsync(usuario);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        return await _repository.DeleteAsync(id);
    }

    public async Task<bool> SetAdminAsync(int id, bool isAdmin)
    {
        return await _repository.SetAdminAsync(id, isAdmin);
    }
}
