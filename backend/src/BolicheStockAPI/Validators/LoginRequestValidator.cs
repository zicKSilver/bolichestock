using BolicheStockAPI.DTOs;
using FluentValidation;

namespace BolicheStockAPI.Validators;

public class LoginRequestValidator : AbstractValidator<LoginRequestDto>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.NombreUsuario)
            .NotEmpty().WithMessage("El nombre de usuario es requerido");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("La contraseña es requerida");
    }
}
