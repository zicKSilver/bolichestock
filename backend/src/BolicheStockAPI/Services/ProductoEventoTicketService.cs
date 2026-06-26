using BolicheStockAPI.Common;
using BolicheStockAPI.DTOs;
using BolicheStockAPI.Models;
using BolicheStockAPI.Repositories;

namespace BolicheStockAPI.Services;

public class ProductoEventoTicketService : IProductoEventoTicketService
{
    private readonly IProductoEventoTicketRepository _repository;
    private readonly IEventoRepository _eventoRepository;
    private readonly IProductoRepository _productoRepository;

    public ProductoEventoTicketService(
        IProductoEventoTicketRepository repository,
        IEventoRepository eventoRepository,
        IProductoRepository productoRepository)
    {
        _repository = repository;
        _eventoRepository = eventoRepository;
        _productoRepository = productoRepository;
    }

    public async Task<List<ProductoEventoTicketResponseDto>> GetByEventoAsync(int eventoId)
    {
        var rollos = await _repository.GetByEventoIdAsync(eventoId);
        return rollos.Select(MapToDto).ToList();
    }

    public async Task<PagedResult<ProductoEventoTicketResponseDto>> GetPagedByEventoAsync(int eventoId, int page, int pageSize)
    {
        var paged = await _repository.GetPagedByEventoIdAsync(eventoId, page, pageSize);
        return new PagedResult<ProductoEventoTicketResponseDto>
        {
            Items = paged.Items.Select(MapToDto).ToList(),
            TotalCount = paged.TotalCount,
            Page = paged.Page,
            PageSize = paged.PageSize
        };
    }

    public async Task<ProductoEventoTicketResponseDto?> CrearAsync(int eventoId, ProductoEventoTicketRequestDto dto)
    {
        var evento = await _eventoRepository.GetWithProductoEventoTicketsAsync(eventoId);
        if (evento is null || evento.Estado == EventoEstado.Cerrado)
            return null;

        var producto = await _productoRepository.GetByIdAsync(dto.ProductoId);
        if (producto is null)
            return null;

        if (dto.NumeroFinal.HasValue && dto.NumeroFinal.Value < dto.NumeroInicial)
            return null;

        var rollo = new ProductoEventoTicket
        {
            EventoId = eventoId,
            ProductoId = dto.ProductoId,
            NumeroInicial = dto.NumeroInicial,
            NumeroFinal = dto.NumeroFinal,
            TotalTicketera = dto.TotalTicketera,
            Completada = dto.Completada ?? false
        };

        var created = await _repository.AddAsync(rollo);
        created.Producto = producto;
        return MapToDto(created);
    }

    public async Task<ProductoEventoTicketResponseDto?> ActualizarAsync(int id, int? numeroInicial, int? numeroFinal, bool? completada, bool limpiarNumeroFinal = false)
    {
        var rollo = await _repository.GetByIdAsync(id);
        if (rollo is null) return null;

        if (numeroInicial.HasValue && numeroInicial.Value > 0)
            rollo.NumeroInicial = numeroInicial.Value;
        if (numeroFinal.HasValue)
        {
            var inicial = numeroInicial ?? rollo.NumeroInicial;
            if (numeroFinal.Value < inicial)
                return null;
            rollo.NumeroFinal = numeroFinal;
        }
        else if (limpiarNumeroFinal)
            rollo.NumeroFinal = null;
        if (completada.HasValue)
            rollo.Completada = completada.Value;

        var updated = await _repository.UpdateAsync(rollo);
        return MapToDto(updated);
    }

    public async Task<bool> EliminarAsync(int id)
    {
        return await _repository.DeleteAsync(id);
    }

    private static ProductoEventoTicketResponseDto MapToDto(ProductoEventoTicket pet)
    {
        var tickets = 0;
        if (pet.NumeroFinal.HasValue)
            tickets = pet.NumeroFinal.Value - pet.NumeroInicial + (pet.Completada ? 1 : 0);

        return new ProductoEventoTicketResponseDto
        {
            Id = pet.Id,
            EventoId = pet.EventoId,
            ProductoId = pet.ProductoId,
            ProductoNombre = pet.Producto?.Nombre ?? "",
            ProductoPrecio = pet.Producto?.Precio ?? 0,
            NumeroInicial = pet.NumeroInicial,
            NumeroFinal = pet.NumeroFinal,
            TotalTicketera = pet.TotalTicketera,
            Completada = pet.Completada,
            TicketsCalculados = tickets,
            Subtotal = tickets * (pet.Producto?.Precio ?? 0)
        };
    }
}
