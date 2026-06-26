namespace BolicheStockAPI.DTOs;

public class ProductoEventoTicketRequestDto
{
    public int ProductoId { get; set; }
    public int NumeroInicial { get; set; }
    public int? NumeroFinal { get; set; }
    public int TotalTicketera { get; set; }
public bool? Completada { get; set; }
public bool LimpiarNumeroFinal { get; set; }
}
