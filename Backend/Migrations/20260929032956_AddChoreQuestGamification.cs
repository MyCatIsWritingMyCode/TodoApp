using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace TodoApp.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddChoreQuestGamification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AssignedMemberId",
                table: "todos",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "todos",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "daily");

            migrationBuilder.AddColumn<string>(
                name: "Recurrence",
                table: "todos",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "XpReward",
                table: "todos",
                type: "integer",
                nullable: false,
                defaultValue: 15);

            migrationBuilder.CreateTable(
                name: "households",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Level = table.Column<int>(type: "integer", nullable: false),
                    CurrentXp = table.Column<int>(type: "integer", nullable: false),
                    XpToNextLevel = table.Column<int>(type: "integer", nullable: false),
                    LevelTitle = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    StreakDays = table.Column<int>(type: "integer", nullable: false),
                    LastStreakDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SkillPoints = table.Column<int>(type: "integer", nullable: false),
                    TotalSkillPointsEarned = table.Column<int>(type: "integer", nullable: false),
                    Tier = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "free"),
                    TotalTasksCompleted = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_households", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "family_members",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Avatar = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Color = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Role = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "member"),
                    ActiveSkinId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "vanilla"),
                    XpContributed = table.Column<int>(type: "integer", nullable: false),
                    TasksCompleted = table.Column<int>(type: "integer", nullable: false),
                    Level = table.Column<int>(type: "integer", nullable: false),
                    HouseholdId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_family_members", x => x.Id);
                    table.ForeignKey(
                        name: "FK_family_members_households_HouseholdId",
                        column: x => x.HouseholdId,
                        principalTable: "households",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_family_members_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "household_perks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PerkId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    UnlockedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    HouseholdId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_household_perks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_household_perks_households_HouseholdId",
                        column: x => x.HouseholdId,
                        principalTable: "households",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "sticky_notes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Content = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Color = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "#FEF08A"),
                    IsPinned = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AuthorId = table.Column<int>(type: "integer", nullable: false),
                    AuthorName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    AuthorAvatar = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    HouseholdId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sticky_notes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_sticky_notes_households_HouseholdId",
                        column: x => x.HouseholdId,
                        principalTable: "households",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_todos_AssignedMemberId",
                table: "todos",
                column: "AssignedMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_family_members_HouseholdId",
                table: "family_members",
                column: "HouseholdId");

            migrationBuilder.CreateIndex(
                name: "IX_family_members_UserId",
                table: "family_members",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_household_perks_HouseholdId",
                table: "household_perks",
                column: "HouseholdId");

            migrationBuilder.CreateIndex(
                name: "IX_sticky_notes_HouseholdId",
                table: "sticky_notes",
                column: "HouseholdId");

            migrationBuilder.AddForeignKey(
                name: "FK_todos_family_members_AssignedMemberId",
                table: "todos",
                column: "AssignedMemberId",
                principalTable: "family_members",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_todos_family_members_AssignedMemberId",
                table: "todos");

            migrationBuilder.DropTable(
                name: "family_members");

            migrationBuilder.DropTable(
                name: "household_perks");

            migrationBuilder.DropTable(
                name: "sticky_notes");

            migrationBuilder.DropTable(
                name: "households");

            migrationBuilder.DropIndex(
                name: "IX_todos_AssignedMemberId",
                table: "todos");

            migrationBuilder.DropColumn(
                name: "AssignedMemberId",
                table: "todos");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "todos");

            migrationBuilder.DropColumn(
                name: "Recurrence",
                table: "todos");

            migrationBuilder.DropColumn(
                name: "XpReward",
                table: "todos");
        }
    }
}
