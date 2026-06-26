using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using BolicheStockAPI.Data;

namespace BolicheStock.Tests.Integration;

public class IntegrationTestFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Test");

        builder.UseSetting("ConnectionStrings:DefaultConnection",
            "Host=localhost;Port=5432;Database=bolichestock_test;Username=postgres;Password=devpass");
        builder.UseSetting("Jwt:Key", TestAuthHelper.JwtKey);
        builder.UseSetting("Jwt:Issuer", TestAuthHelper.Issuer);
        builder.UseSetting("Jwt:Audience", TestAuthHelper.Audience);

        builder.ConfigureTestServices(services =>
        {
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
            if (descriptor is not null)
                services.Remove(descriptor);

            services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql("Host=localhost;Port=5432;Database=bolichestock_test;Username=postgres;Password=devpass"));
        });
    }

    public async Task InitializeAsync()
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.EnsureCreatedAsync();
    }

    public new async Task DisposeAsync()
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.EnsureDeletedAsync();
    }
}
