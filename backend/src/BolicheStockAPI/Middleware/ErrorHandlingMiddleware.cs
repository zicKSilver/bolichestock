using System.Net;
using System.Text.Json;

namespace BolicheStockAPI.Middleware;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;
    private readonly IWebHostEnvironment _env;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger, IWebHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error no controlado: {Message}", ex.Message);

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            var detail = _env.IsDevelopment() ? ex.Message : "Ocurrió un error interno";
            var response = new
            {
                message = "Error interno del servidor",
                error = detail
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}
