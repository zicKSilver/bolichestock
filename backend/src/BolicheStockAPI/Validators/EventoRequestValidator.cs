using BolicheStockAPI.DTOs;
using FluentValidation;

namespace BolicheStockAPI.Validators;

public class EventoRequestValidator : AbstractValidator<EventoRequestDto>
{
    public EventoRequestValidator()
    {
        RuleFor(x => x.Fecha)
            .NotEmpty().WithMessage("La fecha es requerida");
    }
}
