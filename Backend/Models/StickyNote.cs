namespace TodoApp.Api.Models;

public class StickyNote
{
    public int Id { get; set; }
    public string? Title { get; set; }
    public string Content { get; set; } = string.Empty;
    public string Color { get; set; } = "#FEF08A"; // Hex pastel color
    public bool IsPinned { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int AuthorId { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string AuthorAvatar { get; set; } = "🦁";

    public int HouseholdId { get; set; }
    public Household? Household { get; set; }
}

