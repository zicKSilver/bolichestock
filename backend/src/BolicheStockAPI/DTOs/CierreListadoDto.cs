namespace BolicheStockAPI.DTOs;

public class CierreListadoDto
{
    public int Id { get; set; }
    public int EventoId { get; set; }
    public DateTime FechaEvento { get; set; }
    public decimal TotalVendido { get; set; }
    public decimal EfectivoEnCaja { get; set; }
    public decimal DescuentoManual { get; set; }
    public decimal Diferencia { get; set; }
    public DateTime FechaHoraCierre { get; set; }
}
