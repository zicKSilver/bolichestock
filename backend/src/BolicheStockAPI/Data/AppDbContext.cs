using Microsoft.EntityFrameworkCore;
using BolicheStockAPI.Models;

namespace BolicheStockAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Producto> Productos => Set<Producto>();
    public DbSet<Evento> Eventos => Set<Evento>();
    public DbSet<ProductoEventoTicket> ProductoEventoTickets => Set<ProductoEventoTicket>();
    public DbSet<CierreCaja> CierresCaja => Set<CierreCaja>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<ProductoEventoStock> Stocks => Set<ProductoEventoStock>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Producto>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Nombre).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Precio).HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<Evento>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Fecha).IsRequired();
            entity.Property(e => e.Estado)
                .HasConversion<string>()
                .IsRequired()
                .HasMaxLength(20);
        });

        modelBuilder.Entity<ProductoEventoTicket>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.NumeroInicial).IsRequired();
            entity.Property(e => e.NumeroFinal);
            entity.Property(e => e.TotalTicketera).IsRequired();

            entity.HasOne(e => e.Evento)
                .WithMany(e => e.ProductoEventoTickets)
                .HasForeignKey(e => e.EventoId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Producto)
                .WithMany()
                .HasForeignKey(e => e.ProductoId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.EventoId);
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.NombreUsuario).IsRequired().HasMaxLength(50);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.HasIndex(e => e.NombreUsuario).IsUnique();
        });

        modelBuilder.Entity<CierreCaja>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TotalVendido).HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(e => e.EfectivoEnCaja).HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(e => e.DescuentoManual).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Diferencia).HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(e => e.FechaHoraCierre).IsRequired();

            entity.HasOne(e => e.Evento)
                .WithOne(e => e.CierreCaja)
                .HasForeignKey<CierreCaja>(e => e.EventoId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.EventoId).IsUnique();
        });

        modelBuilder.Entity<ProductoEventoStock>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Stock).IsRequired();

            entity.HasOne(e => e.Evento)
                .WithMany()
                .HasForeignKey(e => e.EventoId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Producto)
                .WithMany()
                .HasForeignKey(e => e.ProductoId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => new { e.EventoId, e.ProductoId }).IsUnique();
        });
    }
}
