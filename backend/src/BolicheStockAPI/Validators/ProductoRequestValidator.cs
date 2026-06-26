using BolicheStockAPI.DTOs;
using FluentValidation;

namespace BolicheStockAPI.Validators;

public class ProductoRequestValidator : AbstractValidator<ProductoRequestDto>
{
    public ProductoRequestValidator()
    {
        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre es requerido")
            .MaximumLength(100).WithMessage("El nombre no puede exceder 100 caracteres");

        RuleFor(x => x.Precio)
            .GreaterThan(0).WithMessage("El precio debe ser mayor a 0");
    }
}
