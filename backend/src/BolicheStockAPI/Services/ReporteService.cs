using BolicheStockAPI.DTOs;
using BolicheStockAPI.Repositories;

namespace BolicheStockAPI.Services;

public class ReporteService : IReporteService
{
    private readonly IReporteRepository _repository;

    public ReporteService(IReporteRepository repository)
    {
        _repository = repository;
    }

    public async Task<ReporteGeneralResponseDto> GetByFechaRangeAsync(DateTime desde, DateTime hasta, int? productoId = null)
    {
        var rollos = await _repository.GetByFechaRangeAsync(desde, hasta, productoId);

        var items = rollos
            .GroupBy(pet => pet.Producto)
            .Select(g =>
            {
                var tickets = g.Sum(pet => pet.NumeroFinal!.Value - pet.NumeroInicial + (pet.Completada ? 1 : 0));
                var totalVendido = tickets * (g.Key?.Precio ?? 0);
                var precioPromedio = tickets > 0 ? totalVendido / tickets : 0;

                return new ReporteResponseDto
                {
                    Producto = g.Key?.Nombre ?? "",
                    CantidadTotal = tickets,
                    PrecioPromedioPonderado = precioPromedio,
                    TotalVendido = totalVendido,
                };
            })
            .OrderByDescending(r => r.TotalVendido)
            .ToList();

        var descuentoManual = rollos
            .Where(pet => pet.Evento.CierreCaja != null)
            .Select(pet => pet.Evento.CierreCaja)
            .Distinct()
            .Sum(c => c!.DescuentoManual);

        return new ReporteGeneralResponseDto
        {
            Items = items,
            DescuentoManual = descuentoManual,
        };
    }
}
