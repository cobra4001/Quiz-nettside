using api.Models;
using Microsoft.AspNetCore.Identity;

namespace api.DAL;

public interface IAuthRepository
{
    Task<AuthUser?> FindUserByEmailAsync(string email);
    Task<AuthUser?> FindUserByUsernameAsync(string username);
    Task<AuthUser?> FindUserByIdAsync(string userId);
    Task<IdentityResult> CreateUserAsync(AuthUser user, string password);
    Task<IdentityResult> AddUserToRoleAsync(AuthUser user, string role);
    Task<bool> CheckPasswordAsync(AuthUser user, string password);
    Task<IList<string>> GetUserRolesAsync(AuthUser user);
    Task SignOutAsync();
    Task<IdentityResult> UpdateUserAsync(AuthUser user);
    Task<IdentityResult> ChangePasswordAsync(AuthUser user, string oldPassword, string newPassword);
    Task<IdentityResult> DeleteUserAsync(AuthUser user);
    List<AuthUser> GetAllUsers();
}