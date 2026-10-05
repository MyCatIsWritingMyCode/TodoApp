using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApp.Api.Common.Exceptions;
using TodoApp.Api.Data;
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
        group.MapGet("/", async (TodoDbContext db, CancellationToken ct) =>
        {
            var household = await db.Households
                .Include(h => h.UnlockedPerks)
                .FirstOrDefaultAsync(ct);

            if (household == null)
            {
                return Results.NotFound(new { Message = "No active household found." });
            }

            var unlockedPerkIds = household.UnlockedPerks.Select(p => p.PerkId).ToList();
            if (unlockedPerkIds.Count == 0)
            {
                unlockedPerkIds = new List<string> { "perk-streak-shield", "perk-custom-titles" };
            }

            var unlockedSkinIds = new List<string> { "vanilla", "berry", "dark", "light" };

            var response = new HouseholdResponse(
                household.Id,
                household.Name,
                household.Level,
                household.CurrentXp,
                household.XpToNextLevel,
                household.LevelTitle,
                household.StreakDays,
                household.LastStreakDate?.ToString("yyyy-MM-dd") ?? DateTime.UtcNow.ToString("yyyy-MM-dd"),
                household.SkillPoints,
                household.TotalSkillPointsEarned,
                household.Tier,
                unlockedPerkIds,
                unlockedSkinIds,
                household.TotalTasksCompleted
            );

            return Results.Ok(response);
        })
        .WithName("GetHousehold")
        .WithSummary("Retrieve current household RPG stats")
        .Produces<HouseholdResponse>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);

        // POST /api/household/xp
        group.MapPost("/xp", async ([FromBody] AddXpRequest request, TodoDbContext db, CancellationToken ct) =>
        {
            var household = await db.Households.FirstOrDefaultAsync(ct);
            if (household == null)
            {
                return Results.NotFound(new { Message = "No active household found." });
            }

            household.CurrentXp += request.XpAmount;

            // Handle level up progression
            while (household.CurrentXp >= household.XpToNextLevel)
            {
                household.CurrentXp -= household.XpToNextLevel;
                household.Level++;
                household.XpToNextLevel = (int)(household.XpToNextLevel * 1.25);
                household.SkillPoints++;
                household.TotalSkillPointsEarned++;
                household.LevelTitle = GetLevelTitle(household.Level);
            }

            if (request.MemberId.HasValue)
            {
                var member = await db.FamilyMembers.FindAsync(new object[] { request.MemberId.Value }, ct);
                if (member != null)
                {
                    member.XpContributed += request.XpAmount;
                }
            }

            await db.SaveChangesAsync(ct);

            return Results.Ok(new
            {
                Success = true,
                AddedXp = request.XpAmount,
                household.CurrentXp,
                household.XpToNextLevel,
                household.Level,
                household.LevelTitle,
                household.SkillPoints
            });
        })
        .WithName("AddHouseholdXp")
        .WithSummary("Award XP to the shared household and calculate progression")
        .Produces(StatusCodes.Status200OK);

        // GET /api/household/members
        group.MapGet("/members", async (TodoDbContext db, CancellationToken ct) =>
        {
            var household = await db.Households.FirstOrDefaultAsync(ct);
            var householdId = household?.Id ?? 1;

            var members = await db.FamilyMembers
                .AsNoTracking()
                .Where(m => m.HouseholdId == householdId)
                .OrderBy(m => m.Id)
                .ToListAsync(ct);

            return Results.Ok(members.Select(FamilyMemberResponse.FromEntity));
        })
        .WithName("GetHouseholdMembers")
        .WithSummary("Get all members in the active household")
        .Produces<IEnumerable<FamilyMemberResponse>>(StatusCodes.Status200OK);

        // POST /api/household/members
        group.MapPost("/members", async ([FromBody] CreateMemberRequest request, TodoDbContext db, CancellationToken ct) =>
        {
            var household = await db.Households.FirstOrDefaultAsync(ct);
            if (household == null)
            {
                return Results.NotFound(new { Message = "No active household found." });
            }

            // Enforce tier member limits (Free: 2, Basic: 5, Premium: Unlimited)
            var currentCount = await db.FamilyMembers.CountAsync(m => m.HouseholdId == household.Id, ct);
            var maxMembers = household.Tier.ToLowerInvariant() switch
            {
                "premium" => int.MaxValue,
                "basic" => 5,
                _ => 2 // "free"
            };

            if (currentCount >= maxMembers)
            {
                return Results.BadRequest(new
                {
                    Message = $"Your current plan ({household.Tier}) allows up to {maxMembers} family members. Please upgrade your subscription to add more members."
                });
            }

            var member = new FamilyMember
            {
                Name = request.Name.Trim(),
                Avatar = request.Avatar,
                Color = request.Color,
                Role = string.IsNullOrWhiteSpace(request.Role) ? "member" : request.Role,
                ActiveSkinId = string.IsNullOrWhiteSpace(request.ActiveSkinId) ? "vanilla" : request.ActiveSkinId,
                HouseholdId = household.Id,
                Level = 1,
                XpContributed = 0,
                TasksCompleted = 0
            };

            db.FamilyMembers.Add(member);
            await db.SaveChangesAsync(ct);

            var response = FamilyMemberResponse.FromEntity(member);
            return Results.Created($"/api/household/members/{member.Id}", response);
        })
        .WithName("CreateHouseholdMember")
        .WithSummary("Add a new family member to the household")
        .Produces<FamilyMemberResponse>(StatusCodes.Status201Created)
        .Produces(StatusCodes.Status400BadRequest);

        // PUT /api/household/members/{id}/skin
        group.MapPut("/members/{id:int}/skin", async (int id, [FromBody] UpdateMemberSkinRequest request, TodoDbContext db, CancellationToken ct) =>
        {
            var member = await db.FamilyMembers.FindAsync(new object[] { id }, ct);
            if (member == null)
            {
                return Results.NotFound(new { Message = $"Member with ID {id} not found." });
            }

            member.ActiveSkinId = request.SkinId;
            await db.SaveChangesAsync(ct);

            return Results.Ok(new { Success = true, MemberId = id, SkinId = request.SkinId });
        })
        .WithName("UpdateMemberSkin")
        .WithSummary("Update a family member's personal theme skin")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);

        // GET /api/household/notes
        group.MapGet("/notes", async (TodoDbContext db, CancellationToken ct) =>
        {
            var household = await db.Households.FirstOrDefaultAsync(ct);
            var householdId = household?.Id ?? 1;

            var notes = await db.StickyNotes
                .AsNoTracking()
                .Where(n => n.HouseholdId == householdId)
                .OrderByDescending(n => n.IsPinned)
                .ThenByDescending(n => n.CreatedAt)
                .ToListAsync(ct);

            return Results.Ok(notes.Select(StickyNoteResponse.FromEntity));
        })
        .WithName("GetStickyNotes")
        .WithSummary("Get shared whiteboard sticky notes")
        .Produces<IEnumerable<StickyNoteResponse>>(StatusCodes.Status200OK);

        // POST /api/household/notes
        group.MapPost("/notes", async ([FromBody] CreateStickyNoteRequest request, TodoDbContext db, CancellationToken ct) =>
        {
            var household = await db.Households.FirstOrDefaultAsync(ct);
            if (household == null)
            {
                return Results.NotFound(new { Message = "No active household found." });
            }

            var authorName = "Adventurer";
            var authorAvatar = "🦁";
            var authorId = request.AuthorMemberId ?? 1;

            if (request.AuthorMemberId.HasValue)
            {
                var member = await db.FamilyMembers.FindAsync(new object[] { request.AuthorMemberId.Value }, ct);
                if (member != null)
                {
                    authorName = member.Name;
                    authorAvatar = member.Avatar;
                }
            }

            var note = new StickyNote
            {
                Title = request.Title?.Trim(),
                Content = request.Content.Trim(),
                Color = string.IsNullOrWhiteSpace(request.Color) ? "#FEF08A" : request.Color,
                IsPinned = request.IsPinned,
                CreatedAt = DateTime.UtcNow,
                AuthorId = authorId,
                AuthorName = authorName,
                AuthorAvatar = authorAvatar,
                HouseholdId = household.Id
            };

            db.StickyNotes.Add(note);
            await db.SaveChangesAsync(ct);

            var response = StickyNoteResponse.FromEntity(note);
            return Results.Created($"/api/household/notes/{note.Id}", response);
        })
        .WithName("CreateStickyNote")
        .WithSummary("Post a memo to the shared pinboard")
        .Produces<StickyNoteResponse>(StatusCodes.Status201Created)
        .Produces(StatusCodes.Status400BadRequest);

        // DELETE /api/household/notes/{id}
        group.MapDelete("/notes/{id:int}", async (int id, TodoDbContext db, CancellationToken ct) =>
        {
            var note = await db.StickyNotes.FindAsync(new object[] { id }, ct);
            if (note == null)
            {
                return Results.NotFound(new { Message = $"Sticky note with ID {id} was not found." });
            }

            db.StickyNotes.Remove(note);
            await db.SaveChangesAsync(ct);

            return Results.NoContent();
        })
        .WithName("DeleteStickyNote")
        .WithSummary("Remove a sticky note from the board")
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound);

        // POST /api/household/subscription/upgrade
        group.MapPost("/subscription/upgrade", async ([FromBody] UpgradeTierRequest request, TodoDbContext db, CancellationToken ct) =>
        {
            var household = await db.Households.FirstOrDefaultAsync(ct);
            if (household == null)
            {
                return Results.NotFound(new { Message = "No active household found." });
            }

            household.Tier = request.Tier.ToLowerInvariant();
            await db.SaveChangesAsync(ct);

            return Results.Ok(new { Success = true, NewTier = household.Tier });
        })
        .WithName("UpgradeSubscription")
        .WithSummary("Record one-time lifetime tier unlock")
        .Produces(StatusCodes.Status200OK);

        // GET /api/household/heatmap
        group.MapGet("/heatmap", async (TodoDbContext db, CancellationToken ct) =>
        {
            var startDate = DateTime.UtcNow.Date.AddDays(-29);
            var todos = await db.Todos
                .AsNoTracking()
                .Where(t => t.CreatedAt >= startDate)
                .ToListAsync(ct);

            var days = new List<HeatmapDayDto>();
            for (int i = 0; i < 30; i++)
            {
                var day = startDate.AddDays(i);
                var dayStr = day.ToString("yyyy-MM-dd");
                var total = todos.Count(t => t.CreatedAt.Date == day);
                var completed = todos.Count(t => t.CreatedAt.Date == day && t.IsCompleted);
                var ratio = total > 0 ? Math.Round((double)completed / total, 2) : 0.0;
                days.Add(new HeatmapDayDto(dayStr, total, completed, ratio));
            }

            return Results.Ok(days);
        })
        .WithName("GetCompletionHeatmap")
        .WithSummary("Get 30-day chore completion heatmap ratio data")
        .Produces<IEnumerable<HeatmapDayDto>>(StatusCodes.Status200OK);

        return group;
    }

    private static string GetLevelTitle(int level) => level switch
    {
        1 => "Level 1: Novice Nook",
        2 => "Level 2: Cozy Corner",
        3 => "Level 3: Timber Haven",
        4 => "Level 4: Hearthstone Hall",
        5 => "Level 5: Cozy Cottage",
        6 => "Level 6: Adventurer's Retreat",
        7 => "Level 7: Shielded Stronghold",
        8 => "Level 8: Hero's Keep",
        9 => "Level 9: Mythic Manor",
        _ => $"Level {level}: Legendary Citadel"
    };
}

