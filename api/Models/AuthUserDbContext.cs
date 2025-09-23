using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using api.Models;

namespace api.Models
{
    public class AuthUserDbContext : IdentityDbContext
    {
         public AuthUserDbContext(DbContextOptions<AuthUserDbContext> options) : base(options)
         { }
    }
}

