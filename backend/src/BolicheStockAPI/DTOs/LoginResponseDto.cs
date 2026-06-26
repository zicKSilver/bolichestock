namespace BolicheStockAPI.DTOs;

public class LoginResponseDto
{
    public string Token { get; set; } = "";
    public string NombreUsuario { get; set; } = "";
    public bool IsAdmin { get; set; }
}
