namespace TodoApp.Api.Models;

public class TodoItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsCompleted { get; set; }
    public TodoPriority Priority { get; set; } = TodoPriority.Medium;
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }

    // Relationship to User
    public int? UserId { get; set; }
    public User? User { get; set; }

    // ChoreQuest Gamification Extensions
    public string Category { get; set; } = "daily"; // "daily", "weekly", "recurring"
    public int XpReward { get; set; } = 15;
    public string? Recurrence { get; set; } // "none", "daily", "weekdays", "weekly"
    public int? AssignedMemberId { get; set; }
    public FamilyMember? AssignedMember { get; set; }
}

