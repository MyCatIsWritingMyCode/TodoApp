using System.ComponentModel.DataAnnotations;
using TodoApp.Api.Models;

namespace TodoApp.Api.DTOs;

public record CreateTodoRequest(
    [Required(ErrorMessage = "Title is required.")]
    [StringLength(200, MinimumLength = 1, ErrorMessage = "Title must be between 1 and 200 characters.")]
    string Title,

    [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters.")]
    string? Description = null,

    TodoPriority Priority = TodoPriority.Medium,

    DateTime? DueDate = null,

    string Category = "daily",
    int XpReward = 15,
    string? Recurrence = null,
    int? AssignedMemberId = null
);

public record UpdateTodoRequest(
    [Required(ErrorMessage = "Title is required.")]
    [StringLength(200, MinimumLength = 1, ErrorMessage = "Title must be between 1 and 200 characters.")]
    string Title,

    [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters.")]
    string? Description = null,

    bool IsCompleted = false,

    TodoPriority Priority = TodoPriority.Medium,

    DateTime? DueDate = null,

    string Category = "daily",
    int XpReward = 15,
    string? Recurrence = null,
    int? AssignedMemberId = null
);

public record TodoResponse(
    int Id,
    string Title,
    string? Description,
    bool IsCompleted,
    TodoPriority Priority,
    DateTime? DueDate,
    DateTime CreatedAt,
    DateTime? CompletedAt,
    int? UserId = null,
    string Category = "daily",
    int XpReward = 15,
    string? Recurrence = null,
    int? AssignedMemberId = null,
    FamilyMemberResponse? AssignedMember = null
)
{
    public static TodoResponse FromEntity(TodoItem item) =>
        new(
            item.Id,
            item.Title,
            item.Description,
            item.IsCompleted,
            item.Priority,
            item.DueDate,
            item.CreatedAt,
            item.CompletedAt,
            item.UserId,
            item.Category,
            item.XpReward,
            item.Recurrence,
            item.AssignedMemberId,
            item.AssignedMember != null ? FamilyMemberResponse.FromEntity(item.AssignedMember) : null
        );
}

