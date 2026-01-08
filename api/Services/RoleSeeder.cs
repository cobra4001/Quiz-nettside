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
            var defaultAdminUsername = configuration["DefaultAdmin:Username"] ?? "Admin";
            var defaultAdminEmail = configuration["DefaultAdmin:Email"] ?? "admin@example.com";
            var defaultAdminPassword = configuration["DefaultAdmin:Password"] ?? "Admin1234";
            var defaultAdminPhone = configuration["DefaultAdmin:Phone"] ?? "41234567";

            logger.LogInformation("[RoleSeeder] Cleaning up any existing admin users (case-insensitive)...");



            // Find and delete all users with username "admin" (case-insensitive)
            var allUsers = userManager.Users.ToList();
            var adminUsersToDelete = allUsers.Where(u =>
                u.UserName != null &&
                u.UserName.Equals("admin", StringComparison.OrdinalIgnoreCase))
                .ToList();

            if (adminUsersToDelete.Any())
            {
                logger.LogInformation("[RoleSeeder] Found {Count} existing admin user(s) to delete", adminUsersToDelete.Count);

                foreach (var existingAdmin in adminUsersToDelete)
                {
                    logger.LogInformation("[RoleSeeder] Deleting user '{Username}' (ID: {UserId})", existingAdmin.UserName, existingAdmin.Id);
                    var deleteResult = await userManager.DeleteAsync(existingAdmin);

                    if (deleteResult.Succeeded)
                    {
                        logger.LogInformation("[RoleSeeder] Successfully deleted user '{Username}'", existingAdmin.UserName);
                    }
                    else
                    {
                        logger.LogError("[RoleSeeder] Failed to delete user '{Username}': {Errors}",
                            existingAdmin.UserName,
                            string.Join(", ", deleteResult.Errors.Select(e => e.Description)));
                    }
                }
            }
            else
            {
                logger.LogInformation("[RoleSeeder] No existing admin users found to delete");
            }

            // Now create fresh admin user
            logger.LogInformation("[RoleSeeder] Creating fresh admin user '{Username}'...", defaultAdminUsername);

            var adminUser = new AuthUser
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
                    logger.LogInformation("[RoleSeeder] *** ADMIN LOGIN CREDENTIALS ***");
                    logger.LogInformation("[RoleSeeder] Username: {Username}", defaultAdminUsername);
                    logger.LogInformation("[RoleSeeder] Password: {Password}", defaultAdminPassword);
                    logger.LogInformation("[RoleSeeder] Email: {Email}", defaultAdminEmail);
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

                logger.LogInformation("[RoleSeeder] Default admin creation completed");
            }
        }
    }
}
