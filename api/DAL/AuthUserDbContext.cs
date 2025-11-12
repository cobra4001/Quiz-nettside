using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using api.Models;

namespace api.DAL
{
    // Consolidated DbContext: contains Identity tables and quiz domain tables.
    public class AuthUserDbContext : IdentityDbContext<AuthUser>
    {
        public AuthUserDbContext(DbContextOptions<AuthUserDbContext> options) : base(options)
        { }

        // Quiz domain sets
        public DbSet<Quiz> Quizzes { get; set; } = null!;
        public DbSet<Question> Questions { get; set; } = null!;
        public DbSet<Answer> Answers { get; set; } = null!;
        public DbSet<QuizSubmission> QuizSubmissions { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Optional: explicit relationships (EF would infer these, but we can be explicit for clarity)
            builder.Entity<Quiz>()
                .HasMany(q => q.Questions)
                .WithOne(q => q.Quiz!)
                .HasForeignKey(q => q.QuizId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Question>()
                .HasMany(q => q.Answers)
                .WithOne(a => a.Question!)
                .HasForeignKey(a => a.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Quiz>()
                .HasOne(q => q.Creator)
                .WithMany() // If you later add a collection navigation on AuthUser, adjust this.
                .HasForeignKey(q => q.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Explicit mapping for QuizSubmission to avoid FK failures on delete
            builder.Entity<QuizSubmission>()
                .HasOne(s => s.User)
                .WithMany()
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.Entity<QuizSubmission>()
                .HasOne(s => s.Quiz)
                .WithMany()
                .HasForeignKey(s => s.QuizId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}