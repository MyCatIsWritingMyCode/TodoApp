using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using TodoApp.Api.Common.Exceptions;

namespace TodoApp.Api.Middleware;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var correlationId = httpContext.Items[CorrelationIdMiddleware.CorrelationIdHeader]?.ToString()
                            ?? httpContext.TraceIdentifier;

        var (statusCode, title, detail, errors) = exception switch
        {
            ValidationException valEx => (
                valEx.StatusCode,
                valEx.Title ?? "Validation Failed",
                valEx.Message,
                valEx.Errors
            ),
            ApiException apiEx => (
                apiEx.StatusCode,
                apiEx.Title ?? "API Error",
                apiEx.Message,
                null
            ),
            _ => (
                StatusCodes.Status500InternalServerError,
                "Internal Server Error",
                "An unexpected error occurred while processing your request.",
                null
            )
        };

        if (statusCode >= 500)
        {
            _logger.LogError(exception, "[{CorrelationId}] Unhandled exception occurred: {Message}", correlationId, exception.Message);
        }
        else
        {
            _logger.LogWarning("[{CorrelationId}] Handled business exception ({StatusCode}): {Message}", correlationId, statusCode, exception.Message);
        }

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = httpContext.Request.Path
        };

        problemDetails.Extensions["correlationId"] = correlationId;

        if (errors != null)
        {
            problemDetails.Extensions["errors"] = errors;
        }

        httpContext.Response.StatusCode = statusCode;
        httpContext.Response.ContentType = "application/problem+json";

        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);
        return true;
    }
}

