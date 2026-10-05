using TodoApp.Api.DTOs;
using TodoApp.Api.Services.Auth;
using TodoApp.Api.Services.Security;
using TodoApp.Api.Validators;

namespace TodoApp.Api.Endpoints;

public static class AuthEndpoints
{
    public static RouteGroupBuilder MapAuthEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/auth")
            .WithTags("Authentication");

        // POST /api/auth/register
        group.MapPost("/register", async (RegisterRequest request, IAuthService authService, CancellationToken ct) =>
        {
            var response = await authService.RegisterAsync(request, ct);
            return Results.Created($"/api/auth/me", response);
        })
        .WithName("Register")
        .WithSummary("Register a new user account")
        .WithValidation<RegisterRequest>()
        .RequireRateLimiting("auth-limit")
        .Produces<AuthResponse>(StatusCodes.Status201Created)
        .ProducesValidationProblem()
        .ProducesProblem(StatusCodes.Status409Conflict);

        // POST /api/auth/login
        group.MapPost("/login", async (LoginRequest request, IAuthService authService, CancellationToken ct) =>
        {
            var response = await authService.LoginAsync(request, ct);
            return Results.Ok(response);
        })
        .WithName("Login")
        .WithSummary("Authenticate with username or email and password")
        .WithValidation<LoginRequest>()
        .RequireRateLimiting("auth-limit")
        .Produces<AuthResponse>(StatusCodes.Status200OK)
        .ProducesValidationProblem()
        .ProducesProblem(StatusCodes.Status401Unauthorized);

        // GET /api/auth/me
        group.MapGet("/me", async (ICurrentUserService currentUserService, IAuthService authService, CancellationToken ct) =>
        {
            var userId = currentUserService.GetRequiredUserId();
            var profile = await authService.GetUserProfileAsync(userId, ct);
            return Results.Ok(profile);
        })
        .WithName("GetCurrentUser")
        .WithSummary("Get profile of the currently authenticated user")
        .RequireAuthorization()
        .Produces<UserProfileResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized);

        return group;
    }
}

