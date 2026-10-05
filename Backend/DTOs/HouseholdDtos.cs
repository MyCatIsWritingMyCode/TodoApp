using System.ComponentModel.DataAnnotations;
using TodoApp.Api.Models;

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

public record FamilyMemberResponse(
    int Id,
    string Name,
    string Avatar,
    string Color,
    string Role,
    string ActiveSkinId,
    int XpContributed,
    int TasksCompleted,
    int Level,
    int? UserId = null
)
{
    public static FamilyMemberResponse FromEntity(FamilyMember member) =>
        new(
            member.Id,
            member.Name,
            member.Avatar,
            member.Color,
            member.Role,
            member.ActiveSkinId,
            member.XpContributed,
            member.TasksCompleted,
            member.Level,
            member.UserId
        );
}

public record StickyNoteResponse(
    int Id,
    string? Title,
    string Content,
    string Color,
    bool IsPinned,
    DateTime CreatedAt,
    int AuthorId,
    string AuthorName,
    string AuthorAvatar
)
{
    public static StickyNoteResponse FromEntity(StickyNote note) =>
        new(
            note.Id,
            note.Title,
            note.Content,
            note.Color,
            note.IsPinned,
            note.CreatedAt,
            note.AuthorId,
            note.AuthorName,
            note.AuthorAvatar
        );
}

