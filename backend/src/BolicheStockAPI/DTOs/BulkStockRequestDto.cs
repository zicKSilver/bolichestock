namespace BolicheStockAPI.DTOs;

public class BulkStockRequestDto
{
    public List<StockItemDto> Items { get; set; } = [];
}
