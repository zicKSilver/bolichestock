namespace BolicheStockAPI.DTOs;

public class ProductoEventoTicketResponseDto
{
    public int Id { get; set; }
    public int EventoId { get; set; }
    public int ProductoId { get; set; }
    public string ProductoNombre { get; set; } = "";
    public decimal ProductoPrecio { get; set; }
    public int NumeroInicial { get; set; }
    public int? NumeroFinal { get; set; }
public int TotalTicketera { get; set; }
public bool Completada { get; set; }
public int TicketsCalculados { get; set; }
public decimal Subtotal { get; set; }
}
