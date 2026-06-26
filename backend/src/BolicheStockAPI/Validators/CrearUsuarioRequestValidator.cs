using BolicheStockAPI.DTOs;
using FluentValidation;

namespace BolicheStockAPI.Validators;

public class CrearUsuarioRequestValidator : AbstractValidator<CrearUsuarioRequestDto>
{
    public CrearUsuarioRequestValidator()
    {
        RuleFor(x => x.NombreUsuario)
            .NotEmpty().WithMessage("El nombre de usuario es requerido")
            .MaximumLength(50).WithMessage("El nombre de usuario no puede exceder 50 caracteres");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("La contraseña es requerida")
            .MinimumLength(6).WithMessage("La contraseña debe tener al menos 6 caracteres");
    }
}
