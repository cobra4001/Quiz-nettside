using Microsoft.AspNetCore.Identity;
using api.Models;
using Microsoft.Extensions.Logging;

namespace api.Services
{
    public class RoleSeeder
    {
        public static async Task SeedRoles(IServiceProvider serviceProvider)
        {
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var logger = serviceProvider.GetRequiredService<ILogger<RoleSeeder>>();

            string[] roleNames = { "Admin", "User" };

            logger.LogInformation("[RoleSeeder] Starting role seeding...");

            foreach (var roleName in roleNames)
            {
                var roleExist = await roleManager.RoleExistsAsync(roleName);
                if (!roleExist)
                {
                    var result = await roleManager.CreateAsync(new IdentityRole(roleName));
                    if (result.Succeeded)
                    {
                        logger.LogInformation("[RoleSeeder] Role '{RoleName}' created successfully", roleName);
                    }
                    else
                    {
                        logger.LogError("[RoleSeeder] Failed to create role '{RoleName}': {Errors}",
                            roleName, string.Join(", ", result.Errors.Select(e => e.Description)));
                    }
                }
                else
                {
                    logger.LogInformation("[RoleSeeder] Role '{RoleName}' already exists", roleName);
                }
            }

            logger.LogInformation("[RoleSeeder] Role seeding completed");
        }

        public static async Task CreateDefaultAdmin(IServiceProvider serviceProvider, IConfiguration configuration)
        {
            var userManager = serviceProvider.GetRequiredService<UserManager<AuthUser>>();
            var logger = serviceProvider.GetRequiredService<ILogger<RoleSeeder>>();

            logger.LogInformation("[RoleSeeder] Starting default admin creation...");

            // Get default admin credentials from configuration or use defaults
            var defaultAdminUsername = configuration["DefaultAdmin:Username"] ?? "admin";
            var defaultAdminEmail = configuration["DefaultAdmin:Email"] ?? "admin@example.com";
            var defaultAdminPassword = configuration["DefaultAdmin:Password"] ?? "Admin123!";
            var defaultAdminPhone = configuration["DefaultAdmin:Phone"] ?? "12345678";

            logger.LogInformation("[RoleSeeder] Looking for admin user '{Username}'", defaultAdminUsername);

            // Check if admin user already exists
            var adminUser = await userManager.FindByNameAsync(defaultAdminUsername);

            if (adminUser == null)
            {
                logger.LogInformation("[RoleSeeder] Admin user not found, creating new admin user...");

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
                    logger.LogInformation("[RoleSeeder] Admin user created successfully");

                    var roleResult = await userManager.AddToRoleAsync(adminUser, "Admin");
                    if (roleResult.Succeeded)
                    {
                        logger.LogInformation("[RoleSeeder] Admin role assigned to user '{Username}'", defaultAdminUsername);
                    }
                    else
                    {
                        logger.LogError("[RoleSeeder] Failed to assign Admin role: {Errors}",
                            string.Join(", ", roleResult.Errors.Select(e => e.Description)));
                    }
                }
                else
                {
                    logger.LogError("[RoleSeeder] Failed to create admin user: {Errors}",
                        string.Join(", ", result.Errors.Select(e => e.Description)));
                }
            }
            else
            {
                logger.LogInformation("[RoleSeeder] Admin user '{Username}' already exists", defaultAdminUsername);

                // Ensure existing admin has admin role
                if (!await userManager.IsInRoleAsync(adminUser, "Admin"))
                {
                    logger.LogInformation("[RoleSeeder] Adding Admin role to existing user...");
                    var roleResult = await userManager.AddToRoleAsync(adminUser, "Admin");
                    if (roleResult.Succeeded)
                    {
                        logger.LogInformation("[RoleSeeder] Admin role assigned successfully");
                    }
                    else
                    {
                        logger.LogError("[RoleSeeder] Failed to assign Admin role: {Errors}",
                            string.Join(", ", roleResult.Errors.Select(e => e.Description)));
                    }
                }
                else
                {
                    logger.LogInformation("[RoleSeeder] User '{Username}' already has Admin role", defaultAdminUsername);
                }
            }

            logger.LogInformation("[RoleSeeder] Default admin creation completed");
        }
    }
}
