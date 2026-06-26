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
docker run --name boliche-pg -e POSTGRES_DB=bolichestock -e POSTGRES_PASSWORD=devpass -p 5432:5432 -d postgres:16
```

### Backend

```bash
cd backend/src/BolicheStockAPI
dotnet restore
dotnet run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Tests

```bash
dotnet test backend/BolicheAPI.slnx
```

## Deploy

- **Backend**: Render (Docker)
- **Frontend**: Vercel
- **Database**: Neon
