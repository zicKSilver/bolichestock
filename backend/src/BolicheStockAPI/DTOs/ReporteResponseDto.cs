namespace BolicheStockAPI.DTOs;

public class ReporteResponseDto
{
    public string Producto { get; set; } = "";
    public int CantidadTotal { get; set; }
    public decimal PrecioPromedioPonderado { get; set; }
    public decimal TotalVendido { get; set; }
}

public class ReporteGeneralResponseDto
{
    public List<ReporteResponseDto> Items { get; set; } = [];
    public decimal DescuentoManual { get; set; }
    public decimal TotalBruto => Items.Sum(i => i.TotalVendido);
    public decimal TotalNeto => TotalBruto - DescuentoManual;
}
