using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using BolicheStockAPI;
using BolicheStockAPI.Data;
using BolicheStockAPI.Repositories;
using BolicheStockAPI.Services;
using BolicheStockAPI.Converters;
using BolicheStockAPI.Validators;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Jwt:Key no está configurada. Usá una variable de entorno o appsettings.Development.json");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// Services & Repositories
builder.Services.AddScoped<IProductoRepository, ProductoRepository>();
builder.Services.AddScoped<IProductoService, ProductoService>();
builder.Services.AddScoped<IEventoRepository, EventoRepository>();
builder.Services.AddScoped<IEventoService, EventoService>();
builder.Services.AddScoped<IProductoEventoTicketRepository, ProductoEventoTicketRepository>();
builder.Services.AddScoped<IProductoEventoTicketService, ProductoEventoTicketService>();
builder.Services.AddScoped<ICierreCajaRepository, CierreCajaRepository>();
builder.Services.AddScoped<IReporteRepository, ReporteRepository>();
builder.Services.AddScoped<IReporteService, ReporteService>();
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<IUsuarioService, UsuarioService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IStockRepository, StockRepository>();
builder.Services.AddScoped<IStockService, StockService>();

// FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<ProductoRequestValidator>();
builder.Services.AddFluentValidationAutoValidation();

// Controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.Converters.Add(new UtcDateTimeConverter());
    });

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "BolicheStockAPI", Version = "v1" });
});

// CORS
var corsUrl = builder.Configuration["Cors:FrontendUrl"] ?? "http://localhost:5173";
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(corsUrl)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Rate limiting
builder.Services.AddRateLimiter(options =>
{
    options.AddSlidingWindowLimiter("Fixed", opt =>
    {
        opt.PermitLimit = 100;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.SegmentsPerWindow = 5;
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 5;
    });
});

var app = builder.Build();

app.UseMiddleware<BolicheStockAPI.Middleware.SecurityHeadersMiddleware>();
app.UseMiddleware<BolicheStockAPI.Middleware.ErrorHandlingMiddleware>();
app.UseRateLimiter();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Seed admin user
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (app.Environment.IsDevelopment() || app.Environment.IsEnvironment("Test"))
        context.Database.EnsureCreated();
    else
        await context.Database.MigrateAsync();

    if (!context.Usuarios.Any(u => u.NombreUsuario == "admin"))
    {
        context.Usuarios.Add(new BolicheStockAPI.Models.Usuario
        {
            NombreUsuario = "admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(builder.Configuration["Seed:Password"] ?? "admin123"),
            IsAdmin = true
        });
        context.SaveChanges();
    }
}

app.UseCors("AllowFrontend");

if (!app.Environment.IsProduction())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();