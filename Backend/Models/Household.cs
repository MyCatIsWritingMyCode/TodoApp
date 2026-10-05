namespace TodoApp.Api.Models;

public class Household
{
    public int Id { get; set; }
    public string Name { get; set; } = "The Adventurers Hearth";
    public int Level { get; set; } = 1;
    public int CurrentXp { get; set; } = 0;
    public int XpToNextLevel { get; set; } = 100;
    public string LevelTitle { get; set; } = "Level 1: Novice Nook";
    public int StreakDays { get; set; } = 1;
    public DateTime? LastStreakDate { get; set; }
    public int SkillPoints { get; set; } = 0;
    public int TotalSkillPointsEarned { get; set; } = 0;
    public string Tier { get; set; } = "free"; // "free", "basic", "premium"
    public int TotalTasksCompleted { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<FamilyMember> Members { get; set; } = new List<FamilyMember>();
    public ICollection<StickyNote> StickyNotes { get; set; } = new List<StickyNote>();
    public ICollection<HouseholdPerkUnlock> UnlockedPerks { get; set; } = new List<HouseholdPerkUnlock>();
}

