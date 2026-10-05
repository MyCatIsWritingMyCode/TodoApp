using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using TodoApp.Api.Models;
using TodoApp.Api.Services.Security;

namespace TodoApp.Api.Data;

public class TodoDbContext : DbContext
{
    private readonly IEncryptionService? _encryptionService;

    public TodoDbContext(
        DbContextOptions<TodoDbContext> options,
        IEncryptionService? encryptionService = null) : base(options)
    {
        _encryptionService = encryptionService;
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<TodoItem> Todos => Set<TodoItem>();
    public DbSet<Household> Households => Set<Household>();
    public DbSet<FamilyMember> FamilyMembers => Set<FamilyMember>();
    public DbSet<StickyNote> StickyNotes => Set<StickyNote>();
    public DbSet<HouseholdPerkUnlock> HouseholdPerks => Set<HouseholdPerkUnlock>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure User entity
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.PasswordHash).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Role).IsRequired().HasMaxLength(50).HasDefaultValue("User");
            entity.Property(e => e.CreatedAt).HasColumnType("timestamp with time zone");
            entity.Property(e => e.LastLoginAt).HasColumnType("timestamp with time zone");

            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
        });

        // Configure Household entity
        modelBuilder.Entity<Household>(entity =>
        {
            entity.ToTable("households");
            entity.HasKey(h => h.Id);
            entity.Property(h => h.Id).ValueGeneratedOnAdd();
            entity.Property(h => h.Name).HasMaxLength(150).IsRequired();
            entity.Property(h => h.LevelTitle).HasMaxLength(100);
            entity.Property(h => h.Tier).HasMaxLength(20).HasDefaultValue("free");
            entity.Property(h => h.CreatedAt).HasColumnType("timestamp with time zone");
            entity.Property(h => h.LastStreakDate).HasColumnType("timestamp with time zone");
        });

        // Configure FamilyMember entity
        modelBuilder.Entity<FamilyMember>(entity =>
        {
            entity.ToTable("family_members");
            entity.HasKey(m => m.Id);
            entity.Property(m => m.Id).ValueGeneratedOnAdd();
            entity.Property(m => m.Name).HasMaxLength(100).IsRequired();
            entity.Property(m => m.Avatar).HasMaxLength(50);
            entity.Property(m => m.Color).HasMaxLength(20);
            entity.Property(m => m.Role).HasMaxLength(30).HasDefaultValue("member");
            entity.Property(m => m.ActiveSkinId).HasMaxLength(50).HasDefaultValue("vanilla");

            entity.HasOne(m => m.Household)
                  .WithMany(h => h.Members)
                  .HasForeignKey(m => m.HouseholdId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(m => m.User)
                  .WithMany()
                  .HasForeignKey(m => m.UserId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // Configure StickyNote entity
        modelBuilder.Entity<StickyNote>(entity =>
        {
            entity.ToTable("sticky_notes");
            entity.HasKey(n => n.Id);
            entity.Property(n => n.Id).ValueGeneratedOnAdd();
            entity.Property(n => n.Title).HasMaxLength(200);
            entity.Property(n => n.Content).HasMaxLength(2000).IsRequired();
            entity.Property(n => n.Color).HasMaxLength(20).HasDefaultValue("#FEF08A");
            entity.Property(n => n.AuthorName).HasMaxLength(100);
            entity.Property(n => n.AuthorAvatar).HasMaxLength(50);
            entity.Property(n => n.CreatedAt).HasColumnType("timestamp with time zone");

            entity.HasOne(n => n.Household)
                  .WithMany(h => h.StickyNotes)
                  .HasForeignKey(n => n.HouseholdId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure HouseholdPerkUnlock entity
        modelBuilder.Entity<HouseholdPerkUnlock>(entity =>
        {
            entity.ToTable("household_perks");
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Id).ValueGeneratedOnAdd();
            entity.Property(p => p.PerkId).HasMaxLength(100).IsRequired();
            entity.Property(p => p.UnlockedAt).HasColumnType("timestamp with time zone");

            entity.HasOne(p => p.Household)
                  .WithMany(h => h.UnlockedPerks)
                  .HasForeignKey(p => p.HouseholdId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure TodoItem entity
        modelBuilder.Entity<TodoItem>(entity =>
        {
            entity.ToTable("todos");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);

            // Transparent AES-256-GCM encryption at rest for sensitive descriptions
            if (_encryptionService != null)
            {
                var encryptionConverter = new ValueConverter<string?, string?>(
                    plain => plain == null ? null : _encryptionService.Encrypt(plain),
                    cipher => cipher == null ? null : _encryptionService.Decrypt(cipher));

                entity.Property(e => e.Description)
                    .HasColumnType("text")
                    .HasConversion(encryptionConverter);
            }
            else
            {
                entity.Property(e => e.Description).HasColumnType("text");
            }

            entity.Property(e => e.IsCompleted).HasDefaultValue(false);
            entity.Property(e => e.Priority).HasConversion<int>();
            entity.Property(e => e.CreatedAt).HasColumnType("timestamp with time zone");
            entity.Property(e => e.CompletedAt).HasColumnType("timestamp with time zone");
            entity.Property(e => e.DueDate).HasColumnType("timestamp with time zone");

            // Gamification extensions
            entity.Property(e => e.Category).HasMaxLength(50).HasDefaultValue("daily");
            entity.Property(e => e.XpReward).HasDefaultValue(15);
            entity.Property(e => e.Recurrence).HasMaxLength(50);

            entity.HasIndex(e => e.IsCompleted);
            entity.HasIndex(e => e.DueDate);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.AssignedMemberId);

            // Relationship to User
            entity.HasOne(e => e.User)
                  .WithMany(u => u.Todos)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            // Relationship to FamilyMember
            entity.HasOne(e => e.AssignedMember)
                  .WithMany()
                  .HasForeignKey(e => e.AssignedMemberId)
                  .OnDelete(DeleteBehavior.SetNull);
        });
    }
}

