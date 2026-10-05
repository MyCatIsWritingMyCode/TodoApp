namespace TodoApp.Api.Common.Exceptions;

public abstract class ApiException : Exception
{
    public abstract int StatusCode { get; }
    public string? Title { get; }

    protected ApiException(string message, string? title = null, Exception? innerException = null)
        : base(message, innerException)
    {
        Title = title;
    }
}

public class NotFoundException : ApiException
{
    public override int StatusCode => 404;

    public NotFoundException(string message) : base(message, "Resource Not Found")
    {
    }
}

public class UnauthorizedException : ApiException
{
    public override int StatusCode => 401;

    public UnauthorizedException(string message = "Unauthorized access.") : base(message, "Unauthorized")
    {
    }
}

public class ConflictException : ApiException
{
    public override int StatusCode => 409;

    public ConflictException(string message) : base(message, "Conflict")
    {
    }
}

public class ValidationException : ApiException
{
    public override int StatusCode => 400;
    public IDictionary<string, string[]> Errors { get; }

    public ValidationException(string message) : base(message, "Validation Failed")
    {
        Errors = new Dictionary<string, string[]>
        {
            { "General", new[] { message } }
        };
    }

    public ValidationException(IDictionary<string, string[]> errors)
        : base("One or more validation errors occurred.", "Validation Failed")
    {
        Errors = errors;
    }
}

