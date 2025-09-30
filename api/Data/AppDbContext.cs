using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using api.Models;

namespace api.Data
{
<<<<<<< HEAD
    // AppDbContext arver fra IdentityDbContext<AuthUser> for å inkludere 
    // alle Identity-tabellene (brukere, roller, osv.) automatisk.
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

        // Du kan overstyre OnModelCreating her for å definere 
        // mer komplekse relasjoner, indekser, eller begrensninger.
=======
    public class AppDbContext : DbContext
    {
        
>>>>>>> d93ed7caae41428d7bd44978e98aefffdced0456
    }
}