using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using api.DTOs; 
using api.Models;
using api.DAL;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthRepository _authRepository;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthRepository authRepository,
                              IConfiguration configuration,
                              ILogger<AuthController> logger)
        {
            _authRepository = authRepository;
            _configuration = configuration;
            _logger = logger;
        }

        // --- PRIVATE HELPER METHODS ---

        private string SanitizeForLog(string input)
        {
            if (string.IsNullOrEmpty(input))
                return string.Empty;
            
            return new string(input
                .Where(c => !char.IsControl(c) || c == ' ')
                .Take(100)
                .ToArray());
        }

        // --- AUTHENTICATION ---

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO registerDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var existingEmail = await _authRepository.FindUserByEmailAsync(registerDto.Email);
                if (existingEmail != null)
                    return Conflict(new { Message = $"Email '{registerDto.Email}' is already registered." });

                var user = new AuthUser
                {
                    UserName = registerDto.Username,
                    Email = registerDto.Email,
                    PhoneNumber = registerDto.Phonenumber
                };

                var result = await _authRepository.CreateUserAsync(user, registerDto.Password);

                if (result.Succeeded)
                {
                    // Assign "User" role to newly registered users
                    await _authRepository.AddUserToRoleAsync(user, "User");
                    _logger.LogInformation("[AuthAPIController] user registered with userId: {userId}, username: {username}", 
                        user.Id, user.UserName);
                    return Ok(new { Message = "User registered successfully" });
                }

                var errors = result.Errors.Select(e => e.Description).ToArray();

                if (errors.Any(e => e.Contains("already taken", StringComparison.OrdinalIgnoreCase) ||
                                    e.Contains("is already", StringComparison.OrdinalIgnoreCase)))
                {
                    return Conflict(new { Message = $"User '{registerDto.Username}' already exists." });
                }

                return BadRequest(new { Errors = errors });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[AuthAPIController] Failed to register user with username: {username}", 
                    SanitizeForLog(registerDto.Username));
                return StatusCode(500, new { Message = "Failed to register user." });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO loginDto)
        {
            if (string.IsNullOrWhiteSpace(loginDto.Username))
            {
                return BadRequest(new { Message = "Username is required." });
            }

            try
            {
                var user = await _authRepository.FindUserByUsernameAsync(loginDto.Username);

                if (user != null && await _authRepository.CheckPasswordAsync(user, loginDto.Password))
                {
                    _logger.LogInformation("[AuthAPIController] Successful login for userId: {userId}, username: {username}", 
                        user.Id, user.UserName);
                    var token = await GenerateJwtToken(user);
                    return Ok(new { Token = token });
                }

                _logger.LogWarning("[AuthAPIController] Failed login attempt for username: {username}", 
                    SanitizeForLog(loginDto.Username));
                return Unauthorized();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[AuthAPIController] Exception during login for username: {username}", 
                    SanitizeForLog(loginDto.Username));
                return StatusCode(500, new { Message = "Failed to login." });
            }
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            try
            {
                await _authRepository.SignOutAsync();
                _logger.LogInformation("[AuthAPIController] User logged out, userId: {userId}", userId);
                return Ok(new { Message = "Logout successful" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[AuthAPIController] Failed to logout user, userId: {userId}", userId);
                return StatusCode(500, new { Message = "Failed to logout." });
            }
        }
        
        // --- PROFILE MANAGEMENT ---

        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
                return Unauthorized();

            try
            {
                var user = await _authRepository.FindUserByIdAsync(userId);
                if (user == null)
                    return NotFound(new { Message = "User not found" });

                var roles = await _authRepository.GetUserRolesAsync(user);

                return Ok(new
                {
                    Username = user.UserName,
                    Email = user.Email,
                    Phonenumber = user.PhoneNumber,
                    Roles = roles
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[AuthAPIController] Failed to get profile for userId: {userId}", userId);
                return StatusCode(500, new { Message = "Failed to get profile." });
            }
        }

        [Authorize]
        [HttpPatch("update")]
        public async Task<IActionResult> UpdateContact([FromBody] UpdateContactDTO updateContactDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            try
            {
                var user = await _authRepository.FindUserByIdAsync(userId);
                if (user == null)
                    return NotFound(new { Message = "User not found" });

                // Update contact fields
                user.Email = updateContactDto.Email;
                user.PhoneNumber = updateContactDto.Phonenumber;

                var result = await _authRepository.UpdateUserAsync(user);
                if (result.Succeeded)
                {
                    _logger.LogInformation("[AuthAPIController] User updated contact info, userId: {userId}, username: {username}", 
                        user.Id, user.UserName);
                    return Ok(new { Message = "Contact information updated successfully" });
                }

                var errors = result.Errors.Select(e => e.Description).ToArray();
                return BadRequest(new { Errors = errors });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[AuthAPIController] Failed to update contact for userId: {userId}", userId);
                return StatusCode(500, new { Message = "Failed to update contact information." });
            }
        }

        [Authorize]
        [HttpPatch("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO changePasswordDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            try
            {
                var user = await _authRepository.FindUserByIdAsync(userId);
                if (user == null)
                    return NotFound(new { Message = "User not found" });

                var result = await _authRepository.ChangePasswordAsync(user, changePasswordDto.OldPassword, changePasswordDto.NewPassword);
                if (result.Succeeded)
                {
                    _logger.LogInformation("[AuthAPIController] Password changed for userId: {userId}, username: {username}", 
                        user.Id, user.UserName);
                    return Ok(new { Message = "Password changed successfully" });
                }

                var errors = result.Errors.Select(e => e.Description).ToArray();
                return BadRequest(new { Errors = errors });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[AuthAPIController] Failed to change password for userId: {userId}", userId);
                return StatusCode(500, new { Message = "Failed to change password." });
            }
        }

        [Authorize]
        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteAccount()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            try
            {
                var user = await _authRepository.FindUserByIdAsync(userId);
                if (user == null)
                    return NotFound(new { Message = "User not found" });

                var result = await _authRepository.DeleteUserAsync(user);
                if (result.Succeeded)
                {
                    _logger.LogInformation("[AuthAPIController] Account deleted for userId: {userId}, username: {username}", 
                        user.Id, user.UserName);
                    return Ok(new { Message = "Account deleted successfully" });
                }

                var errors = result.Errors.Select(e => e.Description).ToArray();
                return BadRequest(new { Errors = errors });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[AuthAPIController] Failed to delete account for userId: {userId}", userId);
                return StatusCode(500, new { Message = "Failed to delete account." });
            }
        }

        // --- ADMIN / USER CONTROL ENDPOINTS ---

        /**
         * Retrieves a list of all registered users. Access requires a valid JWT token.
         */
        [Authorize(Roles = "Admin")] // Only admin can get all users
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = _authRepository.GetAllUsers();
                var userDtos = new List<UserDto>();

                foreach (var user in users)
                {
                    // Get roles for each user
                    var userRoles = await _authRepository.GetUserRolesAsync(user);

                    // Make UserDTO
                    userDtos.Add(new UserDto
                    {
                        Id = user.Id,
                        UserName = user.UserName ?? string.Empty,
                        Email = user.Email ?? string.Empty,
                        PhoneNumber = user.PhoneNumber ?? string.Empty,
                        Role = userRoles.FirstOrDefault() ?? "User"
                    });
                }

                return Ok(userDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[AuthAPIController] Failed to get all users");
                return StatusCode(500, new { Message = "Failed to retrieve users." });
            }
        }

        /**
         * Deletes a specific user by ID. Uses the simplified route.
         */
        [Authorize]
        [HttpDelete("user/{userId}")]
        public async Task<IActionResult> DeleteUser(string userId)
        {
            try
            {
                var user = await _authRepository.FindUserByIdAsync(userId);
                if (user == null)
                    return NotFound(new { Message = $"User not found with ID: {userId}" });

                // Prevents deletion of the hardcoded 'admin' user
                if (user.UserName?.ToLower() == "admin")
                    return BadRequest(new { Message = "Cannot delete the default Admin user." });

                var result = await _authRepository.DeleteUserAsync(user);
                
                if (result.Succeeded)
                {
                    _logger.LogInformation("[AuthAPIController] User deleted, userId: {userId}, username: {username}", 
                        user.Id, user.UserName);
                    return Ok(new { Message = $"User '{user.UserName}' deleted successfully." });
                }

                return BadRequest(new { Errors = result.Errors.Select(e => e.Description) });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[AuthAPIController] Failed to delete user, userId: {userId}", 
                    SanitizeForLog(userId));
                return StatusCode(500, new { Message = "Failed to delete user." });
            }
        }

        // --- PRIVATE HELPER METHOD ---

        private async Task<string> GenerateJwtToken(AuthUser user)
        {
            var jwtKey = _configuration["Jwt:Key"];
            if (string.IsNullOrEmpty(jwtKey))
            {
                _logger.LogError("[AuthAPIController] JWT key is missing from configuration.");
                throw new InvalidOperationException("JWT key is missing from configuration.");
            }

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            // Get user roles
            var roles = await _authRepository.GetUserRolesAsync(user);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.UniqueName, user.UserName!),
                new Claim(JwtRegisteredClaimNames.NameId, user.Id),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString())
            };

            // Add role claims
            foreach (var role in roles)
            {
                claims.Add(new Claim("role", role));
            }

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(120),
                signingCredentials: credentials
            );

            _logger.LogInformation("[AuthAPIController] JWT token created for userId: {userId}, username: {username}, roles: {roles}", 
                user.Id, user.UserName, string.Join(", ", roles));
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}