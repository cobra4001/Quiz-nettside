using Microsoft.AspNetCore.Identity;
using api.Models;

namespace api.Services
{
    public class RoleSeeder
    {
        public static async Task SeedRoles(IServiceProvider serviceProvider)
        {
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            string[] roleNames = { "Admin", "User" };

            foreach (var roleName in roleNames)
            {
                var roleExist = await roleManager.RoleExistsAsync(roleName);
                if (!roleExist)
                {
                    await roleManager.CreateAsync(new IdentityRole(roleName));
                }
            }
        }

        public static async Task CreateDefaultAdmin(IServiceProvider serviceProvider, IConfiguration configuration)
        {
            var userManager = serviceProvider.GetRequiredService<UserManager<AuthUser>>();

            // Get default admin credentials from configuration or use defaults
            var defaultAdminUsername = configuration["DefaultAdmin:Username"] ?? "admin";
            var defaultAdminEmail = configuration["DefaultAdmin:Email"] ?? "admin@example.com";
            var defaultAdminPassword = configuration["DefaultAdmin:Password"] ?? "Admin123!";
            var defaultAdminPhone = configuration["DefaultAdmin:Phone"] ?? "12345678";

            // Check if admin user already exists
            var adminUser = await userManager.FindByNameAsync(defaultAdminUsername);

            if (adminUser == null)
            {
                adminUser = new AuthUser
                {
                    UserName = defaultAdminUsername,
                    Email = defaultAdminEmail,
                    PhoneNumber = defaultAdminPhone,
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(adminUser, defaultAdminPassword);

                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, "Admin");
                }
            }
            else
            {
                // Ensure existing admin has admin role
                if (!await userManager.IsInRoleAsync(adminUser, "Admin"))
                {
                    await userManager.AddToRoleAsync(adminUser, "Admin");
                }
            }
        }
    }
}
