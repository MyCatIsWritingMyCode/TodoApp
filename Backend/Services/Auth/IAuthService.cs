using TodoApp.Api.DTOs;

namespace TodoApp.Api.Services.Auth;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default);
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task<UserProfileResponse> GetUserProfileAsync(int userId, CancellationToken ct = default);
}

