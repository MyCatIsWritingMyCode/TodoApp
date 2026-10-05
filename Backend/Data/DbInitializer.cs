using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using TodoApp.Api.Models;
using TodoApp.Api.Services.Security;

namespace TodoApp.Api.Data;

public static class DbInitializer
{
    public static async Task InitializeDatabaseAsync(IServiceProvider serviceProvider, bool isDevelopment = false)
    {
        using var scope = serviceProvider.CreateScope();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<TodoDbContext>>();
        var db = scope.ServiceProvider.GetRequiredService<TodoDbContext>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
        var configuration = scope.ServiceProvider.GetService<IConfiguration>();

        try
        {
            logger.LogInformation("Applying database migrations...");
            await db.Database.MigrateAsync();
            logger.LogInformation("Database migrations applied successfully.");

            var shouldSeed = isDevelopment || (configuration?.GetValue<bool>("SeedDemoData") ?? false);
            if (!shouldSeed)
            {
                logger.LogInformation("Skipping demo and admin seed data in production/non-development environment.");
                return;
            }

            // 1. Seed Demo User
            var demoUser = await db.Users.FirstOrDefaultAsync(u => u.Username == "demo" || u.Email == "demo@todoapp.com");
            if (demoUser == null)
            {
                logger.LogInformation("Seeding default demo user...");
                demoUser = new User
                {
                    Username = "demo",
                    Email = "demo@todoapp.com",
                    PasswordHash = passwordHasher.HashPassword("Password123!"),
                    Role = "User",
                    CreatedAt = DateTime.UtcNow
                };
                db.Users.Add(demoUser);
                await db.SaveChangesAsync();
                logger.LogInformation("Default demo user created with ID {UserId}.", demoUser.Id);
            }

            // 2. Seed Admin User
            var adminUser = await db.Users.FirstOrDefaultAsync(u => u.Username == "admin" || u.Email == "admin@todoapp.com");
            if (adminUser == null)
            {
                logger.LogInformation("Seeding default admin user...");
                adminUser = new User
                {
                    Username = "admin",
                    Email = "admin@todoapp.com",
                    PasswordHash = passwordHasher.HashPassword("AdminPassword123!"),
                    Role = "Admin",
                    CreatedAt = DateTime.UtcNow
                };
                db.Users.Add(adminUser);
                await db.SaveChangesAsync();
                logger.LogInformation("Default admin user created with ID {UserId}.", adminUser.Id);
            }

            // 3. Seed ChoreQuest Household
            var household = await db.Households.FirstOrDefaultAsync();
            if (household == null)
            {
                logger.LogInformation("Seeding ChoreQuest Household: 'The Adventurers Hearth'...");
                household = new Household
                {
                    Name = "The Adventurers Hearth",
                    Level = 5,
                    CurrentXp = 380,
                    XpToNextLevel = 500,
                    LevelTitle = "Level 5: Cozy Cottage",
                    StreakDays = 7,
                    LastStreakDate = DateTime.UtcNow,
                    SkillPoints = 3,
                    TotalSkillPointsEarned = 5,
                    Tier = "free",
                    TotalTasksCompleted = 48,
                    CreatedAt = DateTime.UtcNow
                };
                db.Households.Add(household);
                await db.SaveChangesAsync();
                logger.LogInformation("ChoreQuest Household created with ID {HouseholdId}.", household.Id);

                // Seed Default Perks
                db.HouseholdPerks.AddRange(
                    new HouseholdPerkUnlock { HouseholdId = household.Id, PerkId = "perk-streak-shield", UnlockedAt = DateTime.UtcNow },
                    new HouseholdPerkUnlock { HouseholdId = household.Id, PerkId = "perk-custom-titles", UnlockedAt = DateTime.UtcNow }
                );

                // Seed Default Family Members
                var dad = new FamilyMember
                {
                    HouseholdId = household.Id,
                    Name = "Dad (Alex)",
                    Avatar = "🦁",
                    Color = "#3B82F6",
                    Role = "owner",
                    ActiveSkinId = "vanilla",
                    XpContributed = 380,
                    TasksCompleted = 18,
                    Level = 5,
                    UserId = demoUser.Id
                };
                var mom = new FamilyMember
                {
                    HouseholdId = household.Id,
                    Name = "Mom (Sarah)",
                    Avatar = "🦉",
                    Color = "#EC4899",
                    Role = "admin",
                    ActiveSkinId = "berry",
                    XpContributed = 310,
                    TasksCompleted = 15,
                    Level = 4
                };
                var son = new FamilyMember
                {
                    HouseholdId = household.Id,
                    Name = "Leo (Son)",
                    Avatar = "🚀",
                    Color = "#10B981",
                    Role = "member",
                    ActiveSkinId = "dark",
                    XpContributed = 190,
                    TasksCompleted = 9,
                    Level = 3
                };
                var daughter = new FamilyMember
                {
                    HouseholdId = household.Id,
                    Name = "Maya (Daughter)",
                    Avatar = "🎨",
                    Color = "#F59E0B",
                    Role = "member",
                    ActiveSkinId = "light",
                    XpContributed = 120,
                    TasksCompleted = 6,
                    Level = 2
                };

                db.FamilyMembers.AddRange(dad, mom, son, daughter);
                await db.SaveChangesAsync();

                // Seed Default Sticky Notes
                db.StickyNotes.AddRange(
                    new StickyNote
                    {
                        HouseholdId = household.Id,
                        Title = "📶 Home Wi-Fi Network (Demo)",
                        Content = "SSID: DemoHomeNetwork\nPassword: DemoPassword123!\nGuest WiFi: DemoGuest",
                        Color = "#FEF08A",
                        IsPinned = true,
                        AuthorId = dad.Id,
                        AuthorName = dad.Name,
                        AuthorAvatar = dad.Avatar,
                        CreatedAt = DateTime.UtcNow
                    },
                    new StickyNote
                    {
                        HouseholdId = household.Id,
                        Title = "🦷 Dentist Checkup",
                        Content = "Thursday 3:30 PM at Oakridge Dental for Leo & Maya.",
                        Color = "#FECDD3",
                        IsPinned = true,
                        AuthorId = mom.Id,
                        AuthorName = mom.Name,
                        AuthorAvatar = mom.Avatar,
                        CreatedAt = DateTime.UtcNow
                    }
                );
                await db.SaveChangesAsync();
                logger.LogInformation("ChoreQuest family members and sticky notes seeded successfully.");
            }

            // 4. Link any legacy unassigned todos to the demo user
            var orphanedTodos = await db.Todos.Where(t => t.UserId == null).ToListAsync();
            if (orphanedTodos.Count > 0)
            {
                logger.LogInformation("Assigning {Count} legacy unowned todos to demo user...", orphanedTodos.Count);
                foreach (var todo in orphanedTodos)
                {
                    todo.UserId = demoUser.Id;
                }
                await db.SaveChangesAsync();
            }

            // 5. If demo user has no todos, seed sample items
            if (!await db.Todos.AnyAsync(t => t.UserId == demoUser.Id))
            {
                var firstMember = await db.FamilyMembers.FirstOrDefaultAsync(m => m.HouseholdId == household.Id);
                logger.LogInformation("Seeding initial todos for demo user...");
                db.Todos.AddRange(
                    new TodoItem
                    {
                        UserId = demoUser.Id,
                        Title = "Set up .NET 10 Web API backend",
                        Description = "Initialize the backend project, configure EF Core and Supabase PostgreSQL with AES-256-GCM encryption.",
                        IsCompleted = true,
                        Priority = TodoPriority.High,
                        Category = "daily",
                        XpReward = 30,
                        Recurrence = "daily",
                        AssignedMemberId = firstMember?.Id,
                        CreatedAt = DateTime.UtcNow.AddHours(-2),
                        CompletedAt = DateTime.UtcNow
                    },
                    new TodoItem
                    {
                        UserId = demoUser.Id,
                        Title = "Implement ChoreQuest RPG Gamification",
                        Description = "Add household leveling, streak tracking, family member skins, whiteboard notes, and XP rewards.",
                        IsCompleted = true,
                        Priority = TodoPriority.High,
                        Category = "weekly",
                        XpReward = 50,
                        Recurrence = "none",
                        AssignedMemberId = firstMember?.Id,
                        DueDate = DateTime.UtcNow.AddDays(1),
                        CreatedAt = DateTime.UtcNow.AddHours(-1),
                        CompletedAt = DateTime.UtcNow
                    },
                    new TodoItem
                    {
                        UserId = demoUser.Id,
                        Title = "Connect React Native frontend to REST endpoints",
                        Description = "Wire up ChoreQuest UI to /api/household endpoints and sync family quest state.",
                        IsCompleted = false,
                        Priority = TodoPriority.High,
                        Category = "daily",
                        XpReward = 25,
                        Recurrence = "daily",
                        AssignedMemberId = firstMember?.Id,
                        DueDate = DateTime.UtcNow.AddDays(3),
                        CreatedAt = DateTime.UtcNow
                    }
                );
                await db.SaveChangesAsync();
                logger.LogInformation("Initial ChoreQuest todos seeded successfully.");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while initializing or seeding the database.");
            throw;
        }
    }
}

