namespace TodoApp.Api.Models;

public class HouseholdPerkUnlock
{
    public int Id { get; set; }
    public string PerkId { get; set; } = string.Empty; // e.g. "perk-streak-shield"
    public DateTime UnlockedAt { get; set; } = DateTime.UtcNow;

    public int HouseholdId { get; set; }
    public Household? Household { get; set; }
}

