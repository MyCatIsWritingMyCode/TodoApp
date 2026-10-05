using TodoApp.Api.DTOs;
using TodoApp.Api.Models;

namespace TodoApp.Api.Services.Todos;

public interface ITodoService
{
    Task<IEnumerable<TodoResponse>> GetTodosAsync(
        int userId,
        bool? isCompleted = null,
        TodoPriority? priority = null,
        string? search = null,
        string? sortBy = null,
        CancellationToken ct = default);

    Task<TodoResponse> GetByIdAsync(int id, int userId, CancellationToken ct = default);

    Task<TodoResponse> CreateAsync(CreateTodoRequest request, int userId, CancellationToken ct = default);

    Task<TodoResponse> UpdateAsync(int id, UpdateTodoRequest request, int userId, CancellationToken ct = default);

    Task<TodoResponse> ToggleCompletionAsync(int id, int userId, CancellationToken ct = default);

    Task DeleteAsync(int id, int userId, CancellationToken ct = default);
}

