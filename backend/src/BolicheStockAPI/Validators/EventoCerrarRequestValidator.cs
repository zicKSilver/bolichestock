using BolicheStockAPI.DTOs;
using FluentValidation;

namespace BolicheStockAPI.Validators;

public class EventoCerrarRequestValidator : AbstractValidator<EventoCerrarRequestDto>
{
    public EventoCerrarRequestValidator()
    {
        RuleFor(x => x.EfectivoEnCaja)
            .GreaterThanOrEqualTo(0).WithMessage("El efectivo no puede ser negativo");

        RuleFor(x => x.DescuentoManual)
            .GreaterThanOrEqualTo(0).WithMessage("El descuento no puede ser negativo");
    }
}
