using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using api.Models;

namespace api.Data
{
    public class AppDbContext : IdentityDbContext<AuthUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
           : base(options)
        {
            
        }

        // Legger til DbSets for Quiz-modellene slik at Entity Framework Core (EF Core)
        // kan mappe disse til databasetabeller og administrere relasjoner.
        public DbSet<Quiz> Quizzes { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<Answer> Answers { get; set; }

      
    public class AppDbContext : DbContext
    {
        
    }
}