using BolicheStockAPI.DTOs;
using FluentValidation;

namespace BolicheStockAPI.Validators;

public class ProductoEventoTicketRequestValidator : AbstractValidator<ProductoEventoTicketRequestDto>
{
    public ProductoEventoTicketRequestValidator()
    {
        RuleFor(x => x.ProductoId)
            .GreaterThan(0).WithMessage("El producto es requerido");

        RuleFor(x => x.NumeroInicial)
            .GreaterThanOrEqualTo(1).WithMessage("El número inicial debe ser mayor o igual a 1");

        RuleFor(x => x.TotalTicketera)
            .GreaterThanOrEqualTo(x => x.NumeroInicial)
            .When(x => x.TotalTicketera > 0)
            .WithMessage("El total de la ticketera debe ser mayor o igual al número inicial");
    }
}
