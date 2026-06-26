FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY backend/Directory.Build.props .
COPY backend/src/BolicheStockAPI/BolicheStockAPI.csproj .
RUN dotnet restore
COPY backend/ .
WORKDIR /src/src/BolicheStockAPI
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
RUN apt-get update && apt-get install -y libgssapi-krb5-2 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
EXPOSE 10000
COPY --from=build /app .
ENTRYPOINT ["dotnet", "BolicheStockAPI.dll"]
