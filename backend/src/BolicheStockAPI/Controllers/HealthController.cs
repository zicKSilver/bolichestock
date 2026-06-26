using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BolicheStockAPI.Controllers;

[ApiController]
[AllowAnonymous]
public class HealthController : ControllerBase
{
    [HttpGet("/health")]
    public IActionResult Get()
    {
        return Ok(new
        {
            status = "healthy",
            timestamp = DateTime.UtcNow,
        });
    }
}
