using Microsoft.EntityFrameworkCore;
using BolicheStockAPI.Data;
using BolicheStockAPI.Models;

namespace BolicheStockAPI.Repositories;

public class UsuarioRepository : IUsuarioRepository
{
    private readonly AppDbContext _context;

    public UsuarioRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Usuario>> GetAllAsync()
    {
        return await _context.Usuarios.ToListAsync();
    }

    public async Task<Usuario?> GetByIdAsync(int id)
    {
        return await _context.Usuarios.FindAsync(id);
    }

    public async Task<Usuario?> GetByNombreUsuarioAsync(string nombreUsuario)
    {
        return await _context.Usuarios
            .FirstOrDefaultAsync(u => u.NombreUsuario == nombreUsuario);
    }

    public async Task<Usuario> AddAsync(Usuario usuario)
    {
        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();
        return usuario;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario is null) return false;
        _context.Usuarios.Remove(usuario);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> SetAdminAsync(int id, bool isAdmin)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario is null) return false;
        usuario.IsAdmin = isAdmin;
        await _context.SaveChangesAsync();
        return true;
    }
}
