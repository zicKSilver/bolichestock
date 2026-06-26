namespace BolicheStockAPI.Models;

public class ProductoEventoTicket
{
    public int Id { get; set; }
    public int EventoId { get; set; }
    public int ProductoId { get; set; }
    public int NumeroInicial { get; set; }
    public int? NumeroFinal { get; set; }
    public int TotalTicketera { get; set; }
public bool Completada { get; set; }

    public Evento Evento { get; set; } = null!;
    public Producto Producto { get; set; } = null!;
}
