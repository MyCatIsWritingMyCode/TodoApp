namespace TodoApp.Api.DTOs;

public record EncryptRequest(string PlainText);
public record EncryptResponse(string CipherText, string Algorithm = "AES-256-GCM");

public record DecryptRequest(string CipherText);
public record DecryptResponse(string PlainText, string Algorithm = "AES-256-GCM");

