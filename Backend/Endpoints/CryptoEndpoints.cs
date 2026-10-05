using TodoApp.Api.DTOs;
using TodoApp.Api.Services.Security;

namespace TodoApp.Api.Endpoints;

public static class CryptoEndpoints
{
    public static RouteGroupBuilder MapCryptoEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/crypto")
            .WithTags("Encryption & Security");

        // POST /api/crypto/encrypt
        group.MapPost("/encrypt", (EncryptRequest request, IEncryptionService encryptionService) =>
        {
            if (string.IsNullOrEmpty(request.PlainText))
            {
                return Results.BadRequest(new { Message = "PlainText cannot be empty." });
            }

            var cipherText = encryptionService.Encrypt(request.PlainText);
            return Results.Ok(new EncryptResponse(cipherText));
        })
        .WithName("EncryptPayload")
        .WithSummary("Encrypt plaintext data using AES-256-GCM authenticated encryption")
        .Produces<EncryptResponse>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest);

        // POST /api/crypto/decrypt
        group.MapPost("/decrypt", (DecryptRequest request, IEncryptionService encryptionService) =>
        {
            if (string.IsNullOrEmpty(request.CipherText))
            {
                return Results.BadRequest(new { Message = "CipherText cannot be empty." });
            }

            var plainText = encryptionService.Decrypt(request.CipherText);
            return Results.Ok(new DecryptResponse(plainText));
        })
        .WithName("DecryptPayload")
        .WithSummary("Decrypt and verify ciphertext data using AES-256-GCM")
        .Produces<DecryptResponse>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest);

        return group;
    }
}

