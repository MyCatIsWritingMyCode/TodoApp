using Microsoft.EntityFrameworkCore;
using TodoApp.Api.Common.Exceptions;
using TodoApp.Api.Data;
using TodoApp.Api.DTOs;
using TodoApp.Api.Models;
using TodoApp.Api.Services.Security;

namespace TodoApp.Api.Services.Auth;

public class AuthService : IAuthService
{
    private readonly TodoDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtService _jwtService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        TodoDbContext db,
        IPasswordHasher passwordHasher,
        IJwtService jwtService,
        ILogger<AuthService> logger)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _jwtService = jwtService;
        _logger = logger;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var normalizedUsername = request.Username.Trim();

        _logger.LogInformation("Attempting registration for username '{Username}' and email '{Email}'", normalizedUsername, normalizedEmail);

        // Check if username or email already exists
        var existingUser = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Username.ToLower() == normalizedUsername.ToLower() || u.Email.ToLower() == normalizedEmail, ct);

        if (existingUser != null)
        {
            if (string.Equals(existingUser.Username, normalizedUsername, StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("Registration failed: Username '{Username}' is already taken", normalizedUsername);
                throw new ConflictException($"Username '{normalizedUsername}' is already taken.");
            }

            _logger.LogWarning("Registration failed: Email '{Email}' is already registered", normalizedEmail);
            throw new ConflictException($"Email '{normalizedEmail}' is already registered.");
        }

        // Hash password securely
        var passwordHash = _passwordHasher.HashPassword(request.Password);

        var user = new User
        {
            Username = normalizedUsername,
            Email = normalizedEmail,
            PasswordHash = passwordHash,
            Role = "User",
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);

        _logger.LogInformation("User '{Username}' registered successfully with ID {UserId}", user.Username, user.Id);

        var (token, expiresAt) = _jwtService.GenerateToken(user);
        return new AuthResponse(user.Id, user.Username, user.Email, user.Role, token, expiresAt);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var identifier = request.UsernameOrEmail.Trim();
        var normalizedEmail = identifier.ToLowerInvariant();

        _logger.LogInformation("Processing login attempt for '{Identifier}'", identifier);

        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Username.ToLower() == identifier.ToLower() || u.Email.ToLower() == normalizedEmail, ct);

        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            _logger.LogWarning("Failed login attempt for identifier '{Identifier}'", identifier);
            throw new UnauthorizedException("Invalid username/email or password.");
        }

        user.LastLoginAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        _logger.LogInformation("User '{Username}' (ID {UserId}) logged in successfully", user.Username, user.Id);

        var (token, expiresAt) = _jwtService.GenerateToken(user);
        return new AuthResponse(user.Id, user.Username, user.Email, user.Role, token, expiresAt);
    }

    public async Task<UserProfileResponse> GetUserProfileAsync(int userId, CancellationToken ct = default)
    {
        var user = await _db.Users
            .AsNoTracking()
            .Include(u => u.Todos)
            .FirstOrDefaultAsync(u => u.Id == userId, ct);

        if (user == null)
        {
            throw new NotFoundException($"User with ID {userId} was not found.");
        }

        var totalTodos = user.Todos.Count;
        var completedTodos = user.Todos.Count(t => t.IsCompleted);

        return new UserProfileResponse(
            user.Id,
            user.Username,
            user.Email,
            user.Role,
            user.CreatedAt,
            user.LastLoginAt,
            totalTodos,
            completedTodos
        );
    }
}
