namespace TodoApp.Api.DTOs;

public record RegisterRequest(
    string Username,
    string Email,
    string Password
);

public record LoginRequest(
    string UsernameOrEmail,
    string Password
);

public record AuthResponse(
    int Id,
    string Username,
    string Email,
    string Role,
    string Token,
    DateTime ExpiresAt
);

public record UserProfileResponse(
    int Id,
    string Username,
    string Email,
    string Role,
    DateTime CreatedAt,
    DateTime? LastLoginAt,
    int TotalTodos,
    int CompletedTodos
);

