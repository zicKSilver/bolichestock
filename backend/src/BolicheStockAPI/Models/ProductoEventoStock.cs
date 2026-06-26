namespace BolicheStockAPI.Models;

public class ProductoEventoStock
{
    public int Id { get; set; }
    public int EventoId { get; set; }
    public int ProductoId { get; set; }
    public int Stock { get; set; }
    public int Consumo { get; set; }
    public bool SinStockNecesario { get; set; }

    public Evento Evento { get; set; } = null!;
    public Producto Producto { get; set; } = null!;
}
