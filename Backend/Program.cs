using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using Serilog;
using TodoApp.Api.Data;
using TodoApp.Api.Endpoints;
using TodoApp.Api.Extensions;
using TodoApp.Api.Middleware;

// Configure Serilog bootstrap logger for early startup logging
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("Initializing TodoApp API...");

    var builder = WebApplication.CreateBuilder(args);

    // Setup structured Serilog logging with Console & Daily Rolling File sink
    builder.Host.UseSerilog((context, services, configuration) =>
    {
        configuration
            .ReadFrom.Configuration(context.Configuration)
            .ReadFrom.Services(services)
            .Enrich.FromLogContext()
            .Enrich.WithProperty("Application", "TodoApp.Api")
            .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {CorrelationId} {Message:lj}{NewLine}{Exception}")
            .WriteTo.File(
                path: "logs/todoapp-.log",
                rollingInterval: RollingInterval.Day,
                retainedFileCountLimit: 14,
                outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] [{CorrelationId}] {Message:lj}{NewLine}{Exception}");
    });

    // Configure Supabase PostgreSQL database
    var rawConnectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                              ?? Environment.GetEnvironmentVariable("DATABASE_URL")
                              ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

    var connectionString = ParseConnectionString(rawConnectionString);

    builder.Services.AddDbContext<TodoDbContext>(options =>
    {
        options.UseNpgsql(connectionString);
    });

    // Application & Security layers
    builder.Services.AddApplicationServices(builder.Configuration);
    builder.Services.AddJwtAuthentication(builder.Configuration);
    builder.Services.AddRateLimitingServices();
    builder.Services.AddOpenApiDocumentation();
    builder.Services.AddHealthChecks();

    // Support cloud hosting platforms like Render.com with dynamic PORT binding
    var port = Environment.GetEnvironmentVariable("PORT");
    if (!string.IsNullOrEmpty(port))
    {
        builder.WebHost.UseUrls($"http://+:{port}");
    }

    // Configure forwarded headers for cloud reverse proxies (Render, Cloudflare, etc.)
    builder.Services.Configure<ForwardedHeadersOptions>(options =>
    {
        options.ForwardedHeaders = Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedFor |
                                   Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedProto;
        options.KnownIPNetworks.Clear();
        options.KnownProxies.Clear();
    });

    // Configure CORS for Frontend development
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowFrontend", policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
    });

    var app = builder.Build();

    // Auto-migrate schema & conditionally seed demo data in Development
    await DbInitializer.InitializeDatabaseAsync(app.Services, app.Environment.IsDevelopment());

    // Forwarded headers middleware must run before other middleware
    app.UseForwardedHeaders();

    // Pipeline: Correlation ID and Global Exception Handling first
    app.UseMiddleware<CorrelationIdMiddleware>();
    app.UseExceptionHandler();

    // Serilog HTTP Request Logging
    app.UseSerilogRequestLogging(options =>
    {
        options.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
    });

    // Interactive OpenAPI & Scalar Documentation (accessible in Development and Cloud deployments)
    var enableApiDocs = app.Environment.IsDevelopment() || builder.Configuration.GetValue("EnableApiDocs", true);
    if (enableApiDocs)
    {
        app.MapOpenApi();
        app.MapScalarApiReference(options =>
        {
            options.WithTitle("ChoreQuest API Documentation");
        });
    }

    // Only redirect to HTTPS if not already terminated by reverse proxy
    if (!app.Environment.IsDevelopment() && string.IsNullOrEmpty(port))
    {
        app.UseHttpsRedirection();
    }
    app.UseCors("AllowFrontend");
    app.UseRateLimiter();

    app.UseAuthentication();
    app.UseAuthorization();

    // Redirect root to interactive documentation
    app.MapGet("/", () => Results.Redirect("/scalar/v1"))
       .ExcludeFromDescription();

    // Health check endpoint
    app.MapHealthChecks("/health")
       .WithTags("Health")
       .WithSummary("API and database health check status");

    // Register API endpoints
    app.MapAuthEndpoints();
    app.MapTodoEndpoints();
    app.MapCryptoEndpoints();
    app.MapGamificationEndpoints();

    Log.Information("TodoApp API configuration complete. Running application...");
    app.Run();
}
catch (Exception ex) when (ex is not HostAbortedException)
{
    Log.Fatal(ex, "TodoApp API terminated unexpectedly.");
}
finally
{
    Log.CloseAndFlush();
}

static string ParseConnectionString(string input)
{
    if (input.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase) ||
        input.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase))
    {
        var uri = new Uri(input);
        var userInfo = uri.UserInfo.Split(':', 2);
        var username = Uri.UnescapeDataString(userInfo[0]);
        var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty;
        var database = uri.AbsolutePath.TrimStart('/');
        var port = uri.Port > 0 ? uri.Port : 5432;

        return $"Host={uri.Host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true;";
    }

    return input;
}

