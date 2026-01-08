using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using api.Models;
using api.DTOs;

namespace api.DAL;

public class AuthRepository : IAuthRepository
{
    private readonly UserManager<AuthUser> _userManager;
    private readonly SignInManager<AuthUser> _signInManager;

    public AuthRepository(UserManager<AuthUser> userManager, SignInManager<AuthUser> signInManager)
    {
        _userManager = userManager;
        _signInManager = signInManager;
    }

    public async Task<AuthUser?> FindUserByEmailAsync(string email)
    {
        return await _userManager.FindByEmailAsync(email);
    }

    public async Task<AuthUser?> FindUserByUsernameAsync(string username)
    {
        return await _userManager.FindByNameAsync(username);
    }

    public async Task<AuthUser?> FindUserByIdAsync(string userId)
    {
        return await _userManager.FindByIdAsync(userId);
    }

    public async Task<IdentityResult> CreateUserAsync(AuthUser user, string password)
    {
        return await _userManager.CreateAsync(user, password);
    }

    public async Task<IdentityResult> AddUserToRoleAsync(AuthUser user, string role)
    {
        return await _userManager.AddToRoleAsync(user, role);
    }

    public async Task<bool> CheckPasswordAsync(AuthUser user, string password)
    {
        return await _userManager.CheckPasswordAsync(user, password);
    }

    public async Task<IList<string>> GetUserRolesAsync(AuthUser user)
    {
        return await _userManager.GetRolesAsync(user);
    }

    public async Task SignOutAsync()
    {
        await _signInManager.SignOutAsync();
    }

    public async Task<IdentityResult> UpdateUserAsync(AuthUser user)
    {
        return await _userManager.UpdateAsync(user);
    }

    public async Task<IdentityResult> ChangePasswordAsync(AuthUser user, string oldPassword, string newPassword)
    {
        return await _userManager.ChangePasswordAsync(user, oldPassword, newPassword);
    }

    public async Task<IdentityResult> DeleteUserAsync(AuthUser user)
    {
        return await _userManager.DeleteAsync(user);
    }

    public List<AuthUser> GetAllUsers()
    {
        return _userManager.Users.ToList();
    }
}