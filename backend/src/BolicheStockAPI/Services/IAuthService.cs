using BolicheStockAPI.DTOs;

namespace BolicheStockAPI.Services;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginRequestDto dto);
}
