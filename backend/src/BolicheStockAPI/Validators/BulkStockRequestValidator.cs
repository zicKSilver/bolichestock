using BolicheStockAPI.DTOs;
using FluentValidation;

namespace BolicheStockAPI.Validators;

public class BulkStockRequestValidator : AbstractValidator<BulkStockRequestDto>
{
    public BulkStockRequestValidator()
    {
        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("Debe enviar al menos un item");

        RuleForEach(x => x.Items).SetValidator(new StockItemValidator());
    }
}

public class StockItemValidator : AbstractValidator<StockItemDto>
{
    public StockItemValidator()
    {
        RuleFor(x => x.ProductoId)
            .GreaterThan(0).WithMessage("El producto es requerido");

        RuleFor(x => x.Stock)
            .GreaterThanOrEqualTo(0).WithMessage("El stock no puede ser negativo");

        RuleFor(x => x.Consumo)
            .GreaterThanOrEqualTo(0).WithMessage("El consumo no puede ser negativo");
    }
}
