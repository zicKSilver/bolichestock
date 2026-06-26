namespace BolicheStockAPI.Models;

public class Usuario
{
    public int Id { get; set; }
    public string NombreUsuario { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public bool IsAdmin { get; set; }
}
