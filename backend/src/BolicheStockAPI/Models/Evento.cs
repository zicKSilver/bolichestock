namespace BolicheStockAPI.Models;

public class Evento
{
    public int Id { get; set; }
    public DateTime Fecha { get; set; }
    public EventoEstado Estado { get; set; } = EventoEstado.Abierto;
    public List<ProductoEventoTicket> ProductoEventoTickets { get; set; } = [];
    public CierreCaja? CierreCaja { get; set; }
}
