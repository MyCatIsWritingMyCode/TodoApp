namespace TodoApp.Api.Configuration;

public class JwtSettings
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "TodoApp.Api";
    public string Audience { get; set; } = "TodoApp.Client";

    /// <summary>
    /// HMAC-SHA256 signing secret key (minimum 32 bytes / 256 bits).
    /// MUST be injected securely via user-secrets (local dev) or environment variables (cloud/prod).
    /// NEVER commit a real secret key to source control.
    /// </summary>
    public string SecretKey { get; set; } = string.Empty;

    public int ExpiryMinutes { get; set; } = 1440; // 24 hours
}

