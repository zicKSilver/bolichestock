# BolicheStockAPI

Full-stack stock management system for events.

## Stack

- **Backend**: .NET 10, ASP.NET Core, EF Core + Npgsql (PostgreSQL)
- **Frontend**: React 19, Vite 8, Tailwind v4, React Query, Zod
- **Database**: Neon (serverless PostgreSQL)
- **Auth**: JWT (symmetric key)
- **Validation**: FluentValidation (backend), Zod (frontend)

## Prerequisites

- .NET 10 SDK
- Node.js 22+
- Docker (for local PostgreSQL)

## Setup

### Database

```bash
docker run --name pg-boliche -e POSTGRES_USER=boliche -e POSTGRES_PASSWORD=boliche123 -e POSTGRES_DB=bolichestock -p 5432:5432 -d postgres:16
```

O usando docker-compose (recomendado):

```bash
docker compose up -d
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
cp .env.example .env
npm run dev
```

### Tests

```bash
# Backend
dotnet test backend/BolicheAPI.slnx

# Frontend
cd frontend && npm test
```

## Deploy

- **Backend**: Render (Docker) — setear env vars: `ConnectionStrings__DefaultConnection`, `Seed__Password`, `Cors__FrontendUrl`, `Jwt__Key`
- **Frontend**: Vercel — setear `VITE_API_URL` apuntando al backend
- **Database**: Neon (PostgreSQL serverless)
