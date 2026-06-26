using BolicheStockAPI.Models;

namespace BolicheStockAPI.Repositories;

public interface IUsuarioRepository
{
    Task<List<Usuario>> GetAllAsync();
    Task<Usuario?> GetByIdAsync(int id);
    Task<Usuario?> GetByNombreUsuarioAsync(string nombreUsuario);
    Task<Usuario> AddAsync(Usuario usuario);
    Task<bool> DeleteAsync(int id);
    Task<bool> SetAdminAsync(int id, bool isAdmin);
}
