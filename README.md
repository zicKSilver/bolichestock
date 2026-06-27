# BolicheStockAPI

App de gestión de stock y cierre de caja para boliches. Usa un sistema de ticketeras para controlar ventas de entrada, y permite administrar productos, stocks, eventos y generar reportes de cierre al finalizar la noche.

## Funcionalidades

- **Eventos:** crear, cerrar y desactivar eventos (fechas de boliche)
- **Ticketeras:** asignar numeración de tickets a productos por evento, controlar ventas
- **Stock:** definir stock necesario por producto/evento y registrar consumo real
- **Cierre de Caja:** calcular total vendido, efectivo en caja, descuentos y diferencias
- **Productos:** ABM completo con precios
- **Reportes:** exportar resúmenes por rango de fechas
- **Usuarios:** autenticación JWT, roles admin/user

## Stack

| Capa | Tecnología |
|------|------------|
| Backend | .NET 10, ASP.NET Core, EF Core + Npgsql |
| Frontend | React 19, Vite 8, Tailwind v4, React Query, Zod |
| Base de datos | PostgreSQL (local con Docker, producción con Neon) |
| Autenticación | JWT (clave simétrica) |
| Validación | FluentValidation (backend), Zod (frontend) |

### Arquitectura en capas

```
BolicheStockAPI/
├── backend/
│   └── src/BolicheStockAPI/
│       ├── Controllers/     # Capa de presentación (API REST)
│       ├── Services/        # Capa de negocio
│       ├── Repositories/    # Capa de acceso a datos
│       ├── Models/          # Entidades del dominio
│       ├── DTOs/            # Objetos de transferencia
│       ├── Validators/      # FluentValidation
│       ├── Middleware/      # Error handling, seguridad
│       └── Data/            # DbContext + Migrations
├── frontend/                # React 19 + Vite 8 + Tailwind
├── docker-compose.yml       # PostgreSQL + API
└── Dockerfile               # Build multi-etapa
```

## Modelo de datos: uso compartido

Actualmente la app está diseñada para un **solo boliche / cuenta compartida**. Todos los usuarios autenticados (sean admin o user) ven y operan sobre los mismos productos, eventos, stocks y cierres de caja.

El sistema de usuarios existe únicamente para:
- **Autenticación** (login con JWT)
- **Roles** (`admin` puede crear/eliminar usuarios, `user` solo usa la app)

**¿Y si en el futuro se necesita separar datos por usuario?**

Habría que agregar una columna `UsuarioId` a las entidades (Productos, Eventos, Stocks, etc.) y filtrar todas las consultas por el usuario logueado. La arquitectura en capas lo permite, pero requeriría cambios en modelos, repositorios y controladores.

## Prerrequisitos

- .NET 10 SDK
- Node.js 20+
- Docker (para PostgreSQL local)

## Setup local

### Base de datos

```bash
# Opción recomendada:
docker compose up -d

# O manualmente:
docker run --name pg-boliche -e POSTGRES_USER=boliche -e POSTGRES_PASSWORD=boliche123 -e POSTGRES_DB=bolichestock -p 5432:5432 -d postgres:16
```

### Backend

```bash
cd backend/src/BolicheStockAPI
dotnet restore
dotnet run
```

> **Nota:** En desarrollo necesitás un `appsettings.Development.json` (gitignored) con `Jwt:Key` y `Seed:Password`.
> Usá el `render.yaml` como referencia para los valores de producción.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # editar VITE_API_URL si es necesario
npm run dev
```

### Usuario admin por defecto

> **Usuario:** `admin`
> **Password:** la configurada en `Seed:Password`

## Tests

```bash
# Backend (74 tests: 69 unit + 5 integración)
dotnet test backend/BolicheAPI.slnx

# Frontend (87 tests)
cd frontend && npm test
```

## Variables de Entorno

| Variable | Descripción | Obligatoria |
|----------|-------------|:-----------:|
| `ConnectionStrings__DefaultConnection` | Cadena de conexión PostgreSQL | Sí |
| `Jwt__Key` | Clave secreta para JWT (mín. 32 caracteres) | Sí |
| `Seed__Password` | Password del usuario admin inicial | Sí |
| `Cors__FrontendUrl` | URL del frontend para CORS | Sí |
| `VITE_API_URL` | (Frontend) URL de la API | Sí |

## Deploy

- **Base de datos:** Neon (PostgreSQL serverless gratuito)
- **Backend:** Render — Docker deploy, configurar env vars
- **Frontend:** Vercel — importar repo con `root: frontend/`, setear `VITE_API_URL`
