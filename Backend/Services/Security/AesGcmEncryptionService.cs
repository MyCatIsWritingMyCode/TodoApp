using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using TodoApp.Api.Configuration;

namespace TodoApp.Api.Services.Security;

/// <summary>
/// Implements industry-standard authenticated encryption using AES-256-GCM.
/// Each encryption uses a cryptographically secure random 96-bit Nonce and 128-bit authentication Tag.
/// </summary>
public class AesGcmEncryptionService : IEncryptionService
{
    private readonly byte[] _key;
    private const int NonceSize = 12; // 96 bits recommended for AES-GCM
    private const int TagSize = 16;   // 128 bits authentication tag

    public AesGcmEncryptionService(IOptions<EncryptionSettings> options)
    {
        var secret = options.Value.Key;
        if (string.IsNullOrWhiteSpace(secret))
        {
            throw new InvalidOperationException("Encryption key is not configured.");
        }

        // Derive a consistent 256-bit (32-byte) key using SHA-256
        _key = SHA256.HashData(Encoding.UTF8.GetBytes(secret));
    }

    public string Encrypt(string plainText)
    {
        if (string.IsNullOrEmpty(plainText))
        {
            return plainText;
        }

        byte[] plainBytes = Encoding.UTF8.GetBytes(plainText);
        byte[] nonce = new byte[NonceSize];
        RandomNumberGenerator.Fill(nonce);

        byte[] tag = new byte[TagSize];
        byte[] cipherBytes = new byte[plainBytes.Length];

        using var aesGcm = new AesGcm(_key, TagSize);
        aesGcm.Encrypt(nonce, plainBytes, cipherBytes, tag);

        // Pack: [nonce (12 bytes)] + [tag (16 bytes)] + [cipher bytes]
        byte[] payload = new byte[NonceSize + TagSize + cipherBytes.Length];
        Buffer.BlockCopy(nonce, 0, payload, 0, NonceSize);
        Buffer.BlockCopy(tag, 0, payload, NonceSize, TagSize);
        Buffer.BlockCopy(cipherBytes, 0, payload, NonceSize + TagSize, cipherBytes.Length);

        return Convert.ToBase64String(payload);
    }

    public string Decrypt(string cipherText)
    {
        if (string.IsNullOrEmpty(cipherText))
        {
            return cipherText;
        }

        byte[] payload;
        try
        {
            payload = Convert.FromBase64String(cipherText);
        }
        catch (FormatException)
        {
            // If it wasn't encrypted (e.g. legacy plain text in db), return as is for graceful compatibility
            return cipherText;
        }

        if (payload.Length < NonceSize + TagSize)
        {
            return cipherText;
        }

        byte[] nonce = new byte[NonceSize];
        byte[] tag = new byte[TagSize];
        int cipherSize = payload.Length - NonceSize - TagSize;
        byte[] cipherBytes = new byte[cipherSize];

        Buffer.BlockCopy(payload, 0, nonce, 0, NonceSize);
        Buffer.BlockCopy(payload, NonceSize, tag, 0, TagSize);
        Buffer.BlockCopy(payload, NonceSize + TagSize, cipherBytes, 0, cipherSize);

        byte[] plainBytes = new byte[cipherSize];

        try
        {
            using var aesGcm = new AesGcm(_key, TagSize);
            aesGcm.Decrypt(nonce, cipherBytes, tag, plainBytes);
            return Encoding.UTF8.GetString(plainBytes);
        }
        catch (CryptographicException)
        {
            // Fallback for unencrypted legacy content
            return cipherText;
        }
    }
}

