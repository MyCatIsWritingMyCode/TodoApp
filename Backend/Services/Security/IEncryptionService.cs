namespace TodoApp.Api.Services.Security;

/// <summary>
/// Authenticated encryption service using AES-256-GCM.
/// Ensures both confidentiality and cryptographic integrity of data.
/// </summary>
public interface IEncryptionService
{
    /// <summary>
    /// Encrypts plaintext into a base64 ciphertext string containing nonce, tag, and ciphertext.
    /// </summary>
    string Encrypt(string plainText);

    /// <summary>
    /// Decrypts a base64 ciphertext string back into plaintext after verifying integrity.
    /// </summary>
    string Decrypt(string cipherText);
}

