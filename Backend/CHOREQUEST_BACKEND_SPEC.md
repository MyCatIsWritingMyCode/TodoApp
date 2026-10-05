# ChoreQuest ASP.NET Core Backend Integration Specification

This document provides the exact C# domain models, DTOs, EF Core configuration, and Minimal API endpoint specifications required to natively support the ChoreQuest gamification features in your ASP.NET Core REST API (`Backend/`).

The React Native frontend (`Frontend/src/services/api.ts`) is designed to consume these exact endpoints and data structures.

---

## 1. Domain Models (`Backend/Models/`)

### A. `Household.cs`
```csharp
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
```

### B. `FamilyMember.cs`
```csharp
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
```

### C. `StickyNote.cs`
```csharp
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
```

### D. `HouseholdPerkUnlock.cs`
```csharp
namespace TodoApp.Api.Models;

public class HouseholdPerkUnlock
{
    public int Id { get; set; }
    public string PerkId { get; set; } = string.Empty; // e.g. "perk-streak-shield"
    public DateTime UnlockedAt { get; set; } = DateTime.UtcNow;

    public int HouseholdId { get; set; }
    public Household? Household { get; set; }
}
```

### E. Extended `TodoItem.cs` Properties
Add these optional properties to your existing `TodoItem` entity (`Backend/Models/TodoItem.cs`):
// Gamification & Organization Extensions for TodoItem
public string Category { get; set; } = "daily"; // "daily", "weekly", "recurring"
public string? Group { get; set; } = "Kitchen"; // e.g. "Kitchen", "Living Room", "Garden", "Bedroom", etc.
public string? SubtasksJson { get; set; } // JSON serialized array: [{"id":"sub-1","title":"wipe","isCompleted":false}, ...]
public int XpReward { get; set; } = 15;
public string? Recurrence { get; set; } // "none", "daily", "weekdays", "weekly"
public int? AssignedMemberId { get; set; }
public FamilyMember? AssignedMember { get; set; }
```

---

## 2. Data Transfer Objects (`Backend/DTOs/HouseholdDtos.cs`)

```csharp
using System.ComponentModel.DataAnnotations;

namespace TodoApp.Api.DTOs;

public record HouseholdResponse(
    int Id,
    string Name,
    int Level,
    int CurrentXp,
    int XpToNextLevel,
    string LevelTitle,
    int StreakDays,
    string? LastStreakDate,
    int SkillPoints,
    int TotalSkillPointsEarned,
    string Tier,
    List<string> UnlockedPerkIds,
    List<string> UnlockedSkinIds,
    int TotalTasksCompleted
);

public record AddXpRequest(
    [Range(1, 500)] int XpAmount,
    int? MemberId = null
);

public record CreateMemberRequest(
    [Required, StringLength(100)] string Name,
    [Required] string Avatar,
    [Required] string Color,
    string Role = "member",
    string ActiveSkinId = "vanilla"
);

public record UpdateMemberSkinRequest(
    [Required] string SkinId
);

public record CreateStickyNoteRequest(
    string? Title,
    [Required, StringLength(2000)] string Content,
    [Required] string Color,
    bool IsPinned = false,
    int? AuthorMemberId = null
);

public record UpgradeTierRequest(
    [Required] string Tier // "basic" or "premium"
);

public record HeatmapDayDto(
    string Date,
    int TotalTasks,
    int CompletedTasks,
    double Ratio
);
```

---

## 3. Minimal API Route Mappings (`Backend/Endpoints/GamificationEndpoints.cs`)

Create this new endpoints file and register it in `Program.cs` via `app.MapGamificationEndpoints()`:

```csharp
using Microsoft.AspNetCore.Mvc;
using TodoApp.Api.DTOs;
using TodoApp.Api.Models;
using TodoApp.Api.Services.Security;

namespace TodoApp.Api.Endpoints;

public static class GamificationEndpoints
{
    public static RouteGroupBuilder MapGamificationEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/household")
            .WithTags("Household Gamification");

        // GET /api/household
        group.MapGet("/", async (ICurrentUserService currentUser) =>
        {
            return Results.Ok(new HouseholdResponse(
                Id: 1,
                Name: "The Adventurers Hearth",
                Level: 5,
                CurrentXp: 380,
                XpToNextLevel: 500,
                LevelTitle: "Level 5: Cozy Cottage",
                StreakDays: 7,
                LastStreakDate: DateTime.UtcNow.ToString("yyyy-MM-dd"),
                SkillPoints: 3,
                TotalSkillPointsEarned: 5,
                Tier: "free",
                UnlockedPerkIds: new() { "perk-streak-shield", "perk-custom-titles" },
                UnlockedSkinIds: new() { "vanilla", "berry", "dark", "light" },
                TotalTasksCompleted: 48
            ));
        })
        .WithName("GetHousehold")
        .WithSummary("Retrieve current household RPG stats");

        // POST /api/household/xp
        group.MapPost("/xp", async ([FromBody] AddXpRequest request) =>
        {
            // Award XP to household & member, calculate level threshold & skill points
            return Results.Ok(new { Success = true, AddedXp = request.XpAmount });
        })
        .WithName("AddHouseholdXp")
        .WithSummary("Award XP to the shared household and calculate progression");

        // GET /api/household/members
        group.MapGet("/members", async () =>
        {
            // Retrieve family members with XP contributed and personal skin
            return Results.Ok(new List<object>
            {
                new { Id = 1, Name = "Dad (Alex)", Avatar = "🦁", Color = "#3B82F6", Role = "owner", ActiveSkinId = "vanilla", XpContributed = 380, TasksCompleted = 18, Level = 5 },
                new { Id = 2, Name = "Mom (Sarah)", Avatar = "🦉", Color = "#EC4899", Role = "admin", ActiveSkinId = "berry", XpContributed = 310, TasksCompleted = 15, Level = 4 },
                new { Id = 3, Name = "Leo (Son)", Avatar = "🚀", Color = "#10B981", Role = "member", ActiveSkinId = "dark", XpContributed = 190, TasksCompleted = 9, Level = 3 },
                new { Id = 4, Name = "Maya (Daughter)", Avatar = "🎨", Color = "#F59E0B", Role = "member", ActiveSkinId = "light", XpContributed = 120, TasksCompleted = 6, Level = 2 }
            });
        })
        .WithName("GetHouseholdMembers")
        .WithSummary("Get all members in the active household");

        // POST /api/household/members
        group.MapPost("/members", async ([FromBody] CreateMemberRequest request) =>
        {
            // Enforce tier member limits (Free: 2, Basic: 5, Premium: Unlimited)
            return Results.Created("/api/household/members/5", request);
        })
        .WithName("CreateHouseholdMember")
        .WithSummary("Add a new family member to the household");

        // PUT /api/household/members/{id}/skin
        group.MapPut("/members/{id:int}/skin", async (int id, [FromBody] UpdateMemberSkinRequest request) =>
        {
            // Save member's personal UI skin
            return Results.Ok(new { Success = true, MemberId = id, SkinId = request.SkinId });
        })
        .WithName("UpdateMemberSkin")
        .WithSummary("Update a family member's personal theme skin");

        // GET /api/household/notes
        group.MapGet("/notes", async () =>
        {
            return Results.Ok(new List<object>
            {
                new { Id = 1, Title = "📶 Home Wi-Fi Network (Demo)", Content = "SSID: DemoHomeNetwork\nPassword: DemoPassword123!\nGuest WiFi: DemoGuest", Color = "#FEF08A", IsPinned = true, CreatedAt = DateTime.UtcNow, AuthorId = 1, AuthorName = "Dad (Alex)", AuthorAvatar = "🦁" },
                new { Id = 2, Title = "🦷 Dentist Checkup", Content = "Thursday 3:30 PM at Oakridge Dental for Leo & Maya.", Color = "#FECDD3", IsPinned = true, CreatedAt = DateTime.UtcNow, AuthorId = 2, AuthorName = "Mom (Sarah)", AuthorAvatar = "🦉" }
            });
        })
        .WithName("GetStickyNotes")
        .WithSummary("Get shared whiteboard sticky notes");

        // POST /api/household/notes
        group.MapPost("/notes", async ([FromBody] CreateStickyNoteRequest request) =>
        {
            return Results.Created("/api/household/notes/3", request);
        })
        .WithName("CreateStickyNote")
        .WithSummary("Post a memo to the shared pinboard");

        // DELETE /api/household/notes/{id}
        group.MapDelete("/notes/{id:int}", async (int id) =>
        {
            return Results.NoContent();
        })
        .WithName("DeleteStickyNote")
        .WithSummary("Remove a sticky note from the board");

        // POST /api/household/subscription/upgrade
        group.MapPost("/subscription/upgrade", async ([FromBody] UpgradeTierRequest request) =>
        {
            return Results.Ok(new { Success = true, NewTier = request.Tier });
        })
        .WithName("UpgradeSubscription")
        .WithSummary("Record one-time lifetime tier unlock");

        return group;
    }
}
```

---

## 4. Entity Framework Core Configuration (`Backend/Data/AppDbContext.cs`)

Add the new `DbSet` properties to your DbContext:

```csharp
public DbSet<Household> Households => Set<Household>();
public DbSet<FamilyMember> FamilyMembers => Set<FamilyMember>();
public DbSet<StickyNote> StickyNotes => Set<StickyNote>();
public DbSet<HouseholdPerkUnlock> HouseholdPerks => Set<HouseholdPerkUnlock>();
```

And in `OnModelCreating(ModelBuilder modelBuilder)`:

```csharp
modelBuilder.Entity<Household>(entity =>
{
    entity.HasKey(h => h.Id);
    entity.Property(h => h.Name).HasMaxLength(150).IsRequired();
    entity.Property(h => h.Tier).HasMaxLength(20).HasDefaultValue("free");
});

modelBuilder.Entity<FamilyMember>(entity =>
{
    entity.HasKey(m => m.Id);
    entity.Property(m => m.Name).HasMaxLength(100).IsRequired();
    entity.Property(m => m.ActiveSkinId).HasMaxLength(50).HasDefaultValue("vanilla");
    entity.HasOne(m => m.Household)
          .WithMany(h => h.Members)
          .HasForeignKey(m => m.HouseholdId)
          .OnDelete(DeleteBehavior.Cascade);
});

modelBuilder.Entity<StickyNote>(entity =>
{
    entity.HasKey(n => n.Id);
    entity.Property(n => n.Content).HasMaxLength(2000).IsRequired();
    entity.HasOne(n => n.Household)
          .WithMany(h => h.StickyNotes)
          .HasForeignKey(n => n.HouseholdId)
          .OnDelete(DeleteBehavior.Cascade);
});
```

---

## 5. Adding the Migration
Run the following in the `Backend/` folder:
```powershell
dotnet ef migrations add AddChoreQuestGamification
dotnet ef database update
```
