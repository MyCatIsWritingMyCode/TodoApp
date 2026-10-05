# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project file and restore dependencies (optimizes Docker layer caching)
COPY ["TodoApp.Api.csproj", "./"]
RUN dotnet restore "./TodoApp.Api.csproj"

# Copy remaining source code and publish release build
COPY . .
RUN dotnet publish "./TodoApp.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# Copy compiled binaries from build stage
COPY --from=build /app/publish .

# Default port for ASP.NET Core in container (Render dynamically overrides via $PORT)
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "TodoApp.Api.dll"]

