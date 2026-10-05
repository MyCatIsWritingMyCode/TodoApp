namespace TodoApp.Api.Configuration;

public class EncryptionSettings
{
    public const string SectionName = "Encryption";

    /// <summary>
    /// Cryptographic key for AES-256-GCM authenticated encryption.
    /// MUST be injected securely via user-secrets (local dev) or environment variables (cloud/prod).
    /// NEVER commit a real key to source control.
    /// </summary>
    public string Key { get; set; } = string.Empty;
}

