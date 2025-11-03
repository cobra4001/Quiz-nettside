using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.DTOs;
using api.Models;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly UserManager<AuthUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ILogger<AdminController> _logger;

        public AdminController(
            UserManager<AuthUser> userManager,
            RoleManager<IdentityRole> roleManager,
            ILogger<AdminController> logger)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _logger = logger;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userManager.Users.ToListAsync();
            var userList = new List<object>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userList.Add(new
                {
                    Id = user.Id,
                    Username = user.UserName,
                    Email = user.Email,
                    PhoneNumber = user.PhoneNumber,
                    Roles = roles
                });
            }

            return Ok(userList);
        }

        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { Message = "User not found" });

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                Id = user.Id,
                Username = user.UserName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Roles = roles
            });
        }

        [HttpPost("users/{id}/roles")]
        public async Task<IActionResult> AddRoleToUser(string id, [FromBody] UserRoleDTO userRoleDto)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { Message = "User not found" });

            if (!await _roleManager.RoleExistsAsync(userRoleDto.Role))
                return BadRequest(new { Message = $"Role '{userRoleDto.Role}' does not exist" });

            if (await _userManager.IsInRoleAsync(user, userRoleDto.Role))
                return BadRequest(new { Message = $"User already has the '{userRoleDto.Role}' role" });

            var result = await _userManager.AddToRoleAsync(user, userRoleDto.Role);
            if (result.Succeeded)
            {
                _logger.LogInformation("[AdminController] Added role {role} to user {username}", userRoleDto.Role, user.UserName);
                return Ok(new { Message = $"Role '{userRoleDto.Role}' added to user successfully" });
            }

            var errors = result.Errors.Select(e => e.Description).ToArray();
            return BadRequest(new { Errors = errors });
        }

        [HttpDelete("users/{id}/roles")]
        public async Task<IActionResult> RemoveRoleFromUser(string id, [FromBody] UserRoleDTO userRoleDto)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { Message = "User not found" });

            if (!await _userManager.IsInRoleAsync(user, userRoleDto.Role))
                return BadRequest(new { Message = $"User does not have the '{userRoleDto.Role}' role" });

            var result = await _userManager.RemoveFromRoleAsync(user, userRoleDto.Role);
            if (result.Succeeded)
            {
                _logger.LogInformation("[AdminController] Removed role {role} from user {username}", userRoleDto.Role, user.UserName);
                return Ok(new { Message = $"Role '{userRoleDto.Role}' removed from user successfully" });
            }

            var errors = result.Errors.Select(e => e.Description).ToArray();
            return BadRequest(new { Errors = errors });
        }

        [HttpGet("roles")]
        public async Task<IActionResult> GetAllRoles()
        {
            var roles = await _roleManager.Roles.Select(r => r.Name).ToListAsync();
            return Ok(roles);
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { Message = "User not found" });

            var result = await _userManager.DeleteAsync(user);
            if (result.Succeeded)
            {
                _logger.LogInformation("[AdminController] Deleted user {username}", user.UserName);
                return Ok(new { Message = "User deleted successfully" });
            }

            var errors = result.Errors.Select(e => e.Description).ToArray();
            return BadRequest(new { Errors = errors });
        }
    }
}
