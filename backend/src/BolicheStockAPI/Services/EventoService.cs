using BolicheStockAPI.Common;
using BolicheStockAPI.DTOs;
using BolicheStockAPI.Models;
using BolicheStockAPI.Repositories;

namespace BolicheStockAPI.Services;

public class EventoService : IEventoService
{
    private readonly IEventoRepository _eventoRepository;
    private readonly ICierreCajaRepository _cierreRepository;

    public EventoService(IEventoRepository eventoRepository, ICierreCajaRepository cierreRepository)
    {
        _eventoRepository = eventoRepository;
        _cierreRepository = cierreRepository;
    }

    public async Task<List<EventoResponseDto>> GetAllAsync()
    {
        var eventos = await _eventoRepository.GetAllAsync();
        return eventos.Select(MapToDto).ToList();
    }

    public async Task<PagedResult<EventoResponseDto>> GetPagedAsync(int page, int pageSize)
    {
        var paged = await _eventoRepository.GetPagedAsync(page, pageSize);
        return new PagedResult<EventoResponseDto>
        {
            Items = paged.Items.Select(MapToDto).ToList(),
            TotalCount = paged.TotalCount,
            Page = paged.Page,
            PageSize = paged.PageSize
        };
    }

    public async Task<EventoResponseDto?> GetByIdAsync(int id)
    {
        var evento = await _eventoRepository.GetWithProductoEventoTicketsAsync(id);
        return evento is null ? null : MapToDto(evento);
    }

    public async Task<EventoResponseDto> AbrirAsync(EventoRequestDto dto)
    {
        var evento = new Evento
        {
            Fecha = DateTime.SpecifyKind(dto.Fecha.Date, DateTimeKind.Utc),
            Estado = EventoEstado.Abierto
        };

        var created = await _eventoRepository.AddAsync(evento);
        return MapToDto(created);
    }

    public async Task<EventoResponseDto?> CerrarAsync(int id, EventoCerrarRequestDto dto)
    {
        var evento = await _eventoRepository.GetWithProductoEventoTicketsAsync(id);
        if (evento is null || evento.Estado == EventoEstado.Cerrado)
            return null;

        var totalVendido = evento.ProductoEventoTickets
            .Where(pet => pet.NumeroFinal.HasValue)
            .Sum(pet =>
        {
            var tickets = Math.Max(0, pet.NumeroFinal!.Value - pet.NumeroInicial + (pet.Completada ? 1 : 0));
            return tickets * pet.Producto.Precio;
        });

        var diferencia = dto.EfectivoEnCaja + dto.DescuentoManual - totalVendido;

        var cierre = new CierreCaja
        {
            EventoId = id,
            TotalVendido = totalVendido,
            EfectivoEnCaja = dto.EfectivoEnCaja,
            DescuentoManual = dto.DescuentoManual,
            Diferencia = diferencia,
            FechaHoraCierre = DateTime.UtcNow
        };

        await _cierreRepository.AddAsync(cierre);

        evento.Estado = EventoEstado.Cerrado;
        await _eventoRepository.UpdateAsync(evento);

        return MapToDto(evento);
    }

    public async Task<PagedResult<CierreListadoDto>> GetCierresPagedAsync(int page, int pageSize)
    {
        var paged = await _cierreRepository.GetPagedAsync(page, pageSize);
        return new PagedResult<CierreListadoDto>
        {
            Items = paged.Items.Select(c => new CierreListadoDto
            {
                Id = c.Id,
                EventoId = c.EventoId,
                FechaEvento = c.Evento?.Fecha ?? default,
                TotalVendido = c.TotalVendido,
                EfectivoEnCaja = c.EfectivoEnCaja,
                DescuentoManual = c.DescuentoManual,
                Diferencia = c.Diferencia,
                FechaHoraCierre = c.FechaHoraCierre
            }).ToList(),
            TotalCount = paged.TotalCount,
            Page = paged.Page,
            PageSize = paged.PageSize
        };
    }

    public async Task<EventoResponseDto?> DesactivarAsync(int id)
    {
        var evento = await _eventoRepository.GetWithProductoEventoTicketsAsync(id);
        if (evento is null || evento.Estado == EventoEstado.Cerrado)
            return null;

        evento.Estado = EventoEstado.Cerrado;
        await _eventoRepository.UpdateAsync(evento);

        return MapToDto(evento);
    }

    public async Task<bool> DeleteCierreAsync(int eventoId)
    {
        var cierre = await _cierreRepository.GetByEventoIdAsync(eventoId);
        if (cierre is null) return false;

        var evento = await _eventoRepository.GetWithProductoEventoTicketsAsync(eventoId);
        if (evento is not null)
        {
            evento.Estado = EventoEstado.Abierto;
            await _eventoRepository.UpdateAsync(evento);
        }

        await _cierreRepository.DeleteAsync(cierre);
        return true;
    }

    public async Task<CierreCajaResponseDto?> GetCierreAsync(int eventoId)
    {
        var cierre = await _cierreRepository.GetByEventoIdAsync(eventoId);
        return cierre is null ? null : new CierreCajaResponseDto
        {
            Id = cierre.Id,
            EventoId = cierre.EventoId,
            TotalVendido = cierre.TotalVendido,
            EfectivoEnCaja = cierre.EfectivoEnCaja,
            DescuentoManual = cierre.DescuentoManual,
            Diferencia = cierre.Diferencia,
            FechaHoraCierre = cierre.FechaHoraCierre
        };
    }

    private static EventoResponseDto MapToDto(Evento e)
    {
        var totalTickets = 0;
        var totalVendido = 0m;

        if (e.ProductoEventoTickets is not null)
        {
            foreach (var pet in e.ProductoEventoTickets)
            {
                if (pet.NumeroFinal.HasValue)
                {
                    var tickets = Math.Max(0, pet.NumeroFinal.Value - pet.NumeroInicial + (pet.Completada ? 1 : 0));
                    totalTickets += tickets;
                    totalVendido += tickets * (pet.Producto?.Precio ?? 0);
                }
            }
        }

        return new EventoResponseDto
        {
            Id = e.Id,
            Fecha = e.Fecha,
            Estado = e.Estado.ToString(),
            TotalTickets = totalTickets,
            TotalVendido = totalVendido
        };
    }
}
