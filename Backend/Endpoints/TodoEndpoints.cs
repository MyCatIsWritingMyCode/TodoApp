using TodoApp.Api.DTOs;
using TodoApp.Api.Models;
using TodoApp.Api.Services.Security;
using TodoApp.Api.Services.Todos;
using TodoApp.Api.Validators;

namespace TodoApp.Api.Endpoints;

public static class TodoEndpoints
{
    public static RouteGroupBuilder MapTodoEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/todos")
            .WithTags("Todos")
            .RequireAuthorization();

        // GET /api/todos
        group.MapGet("/", async (
            ITodoService todoService,
            ICurrentUserService currentUserService,
            bool? isCompleted,
            TodoPriority? priority,
            string? search,
            string? sortBy,
            CancellationToken ct) =>
        {
            var userId = currentUserService.GetRequiredUserId();
            var todos = await todoService.GetTodosAsync(userId, isCompleted, priority, search, sortBy, ct);
            return Results.Ok(todos);
        })
        .WithName("GetTodos")
        .WithSummary("Retrieve user's todos with optional filtering and sorting")
        .Produces<IEnumerable<TodoResponse>>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized);

        // GET /api/todos/{id}
        group.MapGet("/{id:int}", async (
            int id,
            ITodoService todoService,
            ICurrentUserService currentUserService,
            CancellationToken ct) =>
        {
            var userId = currentUserService.GetRequiredUserId();
            var todo = await todoService.GetByIdAsync(id, userId, ct);
            return Results.Ok(todo);
        })
        .WithName("GetTodoById")
        .WithSummary("Retrieve a single todo item by ID")
        .Produces<TodoResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .ProducesProblem(StatusCodes.Status401Unauthorized);

        // POST /api/todos
        group.MapPost("/", async (
            CreateTodoRequest request,
            ITodoService todoService,
            ICurrentUserService currentUserService,
            CancellationToken ct) =>
        {
            var userId = currentUserService.GetRequiredUserId();
            var todo = await todoService.CreateAsync(request, userId, ct);
            return Results.Created($"/api/todos/{todo.Id}", todo);
        })
        .WithName("CreateTodo")
        .WithSummary("Create a new todo item")
        .WithValidation<CreateTodoRequest>()
        .Produces<TodoResponse>(StatusCodes.Status201Created)
        .ProducesValidationProblem()
        .ProducesProblem(StatusCodes.Status401Unauthorized);

        // PUT /api/todos/{id}
        group.MapPut("/{id:int}", async (
            int id,
            UpdateTodoRequest request,
            ITodoService todoService,
            ICurrentUserService currentUserService,
            CancellationToken ct) =>
        {
            var userId = currentUserService.GetRequiredUserId();
            var updated = await todoService.UpdateAsync(id, request, userId, ct);
            return Results.Ok(updated);
        })
        .WithName("UpdateTodo")
        .WithSummary("Update an existing todo item")
        .WithValidation<UpdateTodoRequest>()
        .Produces<TodoResponse>(StatusCodes.Status200OK)
        .ProducesValidationProblem()
        .ProducesProblem(StatusCodes.Status404NotFound)
        .ProducesProblem(StatusCodes.Status401Unauthorized);

        // PATCH /api/todos/{id}/toggle
        group.MapPatch("/{id:int}/toggle", async (
            int id,
            ITodoService todoService,
            ICurrentUserService currentUserService,
            CancellationToken ct) =>
        {
            var userId = currentUserService.GetRequiredUserId();
            var toggled = await todoService.ToggleCompletionAsync(id, userId, ct);
            return Results.Ok(toggled);
        })
        .WithName("ToggleTodoCompletion")
        .WithSummary("Toggle the completion status of a todo item")
        .Produces<TodoResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .ProducesProblem(StatusCodes.Status401Unauthorized);

        // DELETE /api/todos/{id}
        group.MapDelete("/{id:int}", async (
            int id,
            ITodoService todoService,
            ICurrentUserService currentUserService,
            CancellationToken ct) =>
        {
            var userId = currentUserService.GetRequiredUserId();
            await todoService.DeleteAsync(id, userId, ct);
            return Results.NoContent();
        })
        .WithName("DeleteTodo")
        .WithSummary("Delete a todo item by ID")
        .Produces(StatusCodes.Status204NoContent)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .ProducesProblem(StatusCodes.Status401Unauthorized);

        return group;
    }
}

