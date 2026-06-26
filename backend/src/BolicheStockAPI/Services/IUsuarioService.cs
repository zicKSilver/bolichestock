using BolicheStockAPI.DTOs;
using BolicheStockAPI.Models;

namespace BolicheStockAPI.Services;

public interface IUsuarioService
{
    Task<List<Usuario>> GetAllAsync();
    Task<Usuario?> GetByIdAsync(int id);
    Task<Usuario?> CreateAsync(CrearUsuarioRequestDto dto);
    Task<bool> DeleteAsync(int id);
    Task<bool> SetAdminAsync(int id, bool isAdmin);
}
