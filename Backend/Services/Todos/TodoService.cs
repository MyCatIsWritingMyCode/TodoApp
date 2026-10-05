using Microsoft.EntityFrameworkCore;
using TodoApp.Api.Common.Exceptions;
using TodoApp.Api.Data;
using TodoApp.Api.DTOs;
using TodoApp.Api.Models;

namespace TodoApp.Api.Services.Todos;

public class TodoService : ITodoService
{
    private readonly TodoDbContext _db;
    private readonly ILogger<TodoService> _logger;

    public TodoService(TodoDbContext db, ILogger<TodoService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<IEnumerable<TodoResponse>> GetTodosAsync(
        int userId,
        bool? isCompleted = null,
        TodoPriority? priority = null,
        string? search = null,
        string? sortBy = null,
        CancellationToken ct = default)
    {
        var query = _db.Todos
            .AsNoTracking()
            .Include(t => t.AssignedMember)
            .Where(t => t.UserId == userId);

        if (isCompleted.HasValue)
        {
            query = query.Where(t => t.IsCompleted == isCompleted.Value);
        }

        if (priority.HasValue)
        {
            query = query.Where(t => t.Priority == priority.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(t => t.Title.ToLower().Contains(term) ||
                                     (t.Description != null && t.Description.ToLower().Contains(term)));
        }

        query = sortBy?.ToLowerInvariant() switch
        {
            "duedate" => query.OrderBy(t => t.DueDate),
            "priority" => query.OrderByDescending(t => t.Priority),
            "title" => query.OrderBy(t => t.Title),
            _ => query.OrderByDescending(t => t.CreatedAt)
        };

        var todos = await query.ToListAsync(ct);
        return todos.Select(TodoResponse.FromEntity);
    }

    public async Task<TodoResponse> GetByIdAsync(int id, int userId, CancellationToken ct = default)
    {
        var todo = await _db.Todos
            .AsNoTracking()
            .Include(t => t.AssignedMember)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId, ct);

        if (todo == null)
        {
            _logger.LogWarning("Todo {TodoId} not found for User {UserId}", id, userId);
            throw new NotFoundException($"Todo item with ID {id} was not found.");
        }

        return TodoResponse.FromEntity(todo);
    }

    public async Task<TodoResponse> CreateAsync(CreateTodoRequest request, int userId, CancellationToken ct = default)
    {
        var todo = new TodoItem
        {
            UserId = userId,
            Title = request.Title.Trim(),
            Description = request.Description?.Trim(),
            Priority = request.Priority,
            DueDate = ToUtc(request.DueDate),
            Category = request.Category ?? "daily",
            XpReward = request.XpReward > 0 ? request.XpReward : 15,
            Recurrence = request.Recurrence,
            AssignedMemberId = request.AssignedMemberId,
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow
        };

        _db.Todos.Add(todo);
        await _db.SaveChangesAsync(ct);

        if (todo.AssignedMemberId.HasValue)
        {
            await _db.Entry(todo).Reference(t => t.AssignedMember).LoadAsync(ct);
        }

        _logger.LogInformation("Created Todo {TodoId} for User {UserId}", todo.Id, userId);
        return TodoResponse.FromEntity(todo);
    }

    public async Task<TodoResponse> UpdateAsync(int id, UpdateTodoRequest request, int userId, CancellationToken ct = default)
    {
        var todo = await _db.Todos
            .Include(t => t.AssignedMember)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId, ct);

        if (todo == null)
        {
            _logger.LogWarning("Update failed: Todo {TodoId} not found for User {UserId}", id, userId);
            throw new NotFoundException($"Todo item with ID {id} was not found.");
        }

        todo.Title = request.Title.Trim();
        todo.Description = request.Description?.Trim();
        todo.Priority = request.Priority;
        todo.DueDate = ToUtc(request.DueDate);
        todo.Category = request.Category ?? todo.Category;
        todo.XpReward = request.XpReward > 0 ? request.XpReward : todo.XpReward;
        todo.Recurrence = request.Recurrence;
        todo.AssignedMemberId = request.AssignedMemberId;

        if (request.IsCompleted && !todo.IsCompleted)
        {
            todo.IsCompleted = true;
            todo.CompletedAt = DateTime.UtcNow;
        }
        else if (!request.IsCompleted && todo.IsCompleted)
        {
            todo.IsCompleted = false;
            todo.CompletedAt = null;
        }

        await _db.SaveChangesAsync(ct);

        if (todo.AssignedMemberId.HasValue && (todo.AssignedMember == null || todo.AssignedMember.Id != todo.AssignedMemberId.Value))
        {
            await _db.Entry(todo).Reference(t => t.AssignedMember).LoadAsync(ct);
        }

        _logger.LogInformation("Updated Todo {TodoId} for User {UserId}", todo.Id, userId);

        return TodoResponse.FromEntity(todo);
    }

    public async Task<TodoResponse> ToggleCompletionAsync(int id, int userId, CancellationToken ct = default)
    {
        var todo = await _db.Todos
            .Include(t => t.AssignedMember)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId, ct);

        if (todo == null)
        {
            _logger.LogWarning("Toggle failed: Todo {TodoId} not found for User {UserId}", id, userId);
            throw new NotFoundException($"Todo item with ID {id} was not found.");
        }

        todo.IsCompleted = !todo.IsCompleted;
        todo.CompletedAt = todo.IsCompleted ? DateTime.UtcNow : null;

        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Toggled Todo {TodoId} completion to {IsCompleted} for User {UserId}", todo.Id, todo.IsCompleted, userId);

        return TodoResponse.FromEntity(todo);
    }

    public async Task DeleteAsync(int id, int userId, CancellationToken ct = default)
    {
        var todo = await _db.Todos
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId, ct);

        if (todo == null)
        {
            _logger.LogWarning("Delete failed: Todo {TodoId} not found for User {UserId}", id, userId);
            throw new NotFoundException($"Todo item with ID {id} was not found.");
        }

        _db.Todos.Remove(todo);
        await _db.SaveChangesAsync(ct);

        _logger.LogInformation("Deleted Todo {TodoId} for User {UserId}", id, userId);
    }

    private static DateTime? ToUtc(DateTime? dt) =>
        dt.HasValue
            ? (dt.Value.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(dt.Value, DateTimeKind.Utc)
                : dt.Value.ToUniversalTime())
            : null;
}

