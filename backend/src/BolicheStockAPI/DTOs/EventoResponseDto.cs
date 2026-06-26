namespace BolicheStockAPI.DTOs;

public class EventoResponseDto
{
    public int Id { get; set; }
    public DateTime Fecha { get; set; }
    public string Estado { get; set; } = "";
    public int TotalTickets { get; set; }
    public decimal TotalVendido { get; set; }
}
