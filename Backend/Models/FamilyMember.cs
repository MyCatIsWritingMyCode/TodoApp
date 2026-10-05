namespace TodoApp.Api.Models;

public class FamilyMember
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Avatar { get; set; } = "🦁"; // Emoji or Avatar Key
    public string Color { get; set; } = "#3B82F6";
    public string Role { get; set; } = "member"; // "owner", "admin", "member"
    public string ActiveSkinId { get; set; } = "vanilla"; // Per-user UI Skin!
    public int XpContributed { get; set; } = 0;
    public int TasksCompleted { get; set; } = 0;
    public int Level { get; set; } = 1;

    public int HouseholdId { get; set; }
    public Household? Household { get; set; }

    public int? UserId { get; set; }
    public User? User { get; set; }
}

