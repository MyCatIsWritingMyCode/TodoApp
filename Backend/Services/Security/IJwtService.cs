using TodoApp.Api.Models;

namespace TodoApp.Api.Services.Security;

public interface IJwtService
{
    (string Token, DateTime ExpiresAt) GenerateToken(User user);
}

