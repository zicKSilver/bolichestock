namespace BolicheStockAPI.DTOs;

public class StockItemDto
{
    public int ProductoId { get; set; }
    public string ProductoNombre { get; set; } = "";
    public int Stock { get; set; }
    public int Consumo { get; set; }
    public bool SinStockNecesario { get; set; }
}
