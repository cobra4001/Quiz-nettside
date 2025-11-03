using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using api.DTOs; 
using api.Models; 
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Logging; 

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<AuthUser> _userManager;
        private readonly SignInManager<AuthUser> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;

        public AuthController(UserManager<AuthUser> userManager,
                              SignInManager<AuthUser> signInManager,
                              IConfiguration configuration,
                              ILogger<AuthController> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _logger = logger;
        }

        // --- AUTHENTICATION ---

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO registerDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existingEmail = await _userManager.FindByEmailAsync(registerDto.Email);
            if (existingEmail != null)
                return Conflict(new { Message = $"Email '{registerDto.Email}' is already registered." });

            var user = new AuthUser
            {
                UserName = registerDto.Username,
                Email = registerDto.Email,
                PhoneNumber = registerDto.Phonenumber
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);

        if (result.Succeeded)
        {
            // Assign "User" role to newly registered users
            await _userManager.AddToRoleAsync(user, "User");
            _logger.LogInformation("[AuthAPIController] user registered for {@username}", registerDto.Username);
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

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO loginDto)
        {
            var user = await _userManager.FindByNameAsync(loginDto.Username);

            if (user != null && await _userManager.CheckPasswordAsync(user, loginDto.Password))
            {
                _logger.LogInformation("[AuthAPIController] user authorised for {@username}", loginDto.Username);
                var token = await GenerateJwtToken(user);
                return Ok(new { Token = token });
            }

            _logger.LogWarning("[AuthAPIController] user not authorised for {@username}", loginDto.Username);
            return Unauthorized();
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            _logger.LogInformation("[AuthAPIController] user logged out");
            return Ok(new { Message = "Logout successful" });
        }
        
        // --- PROFILE MANAGEMENT ---

        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound(new { Message = "User not found" });

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                Username = user.UserName,
                Email = user.Email,
                Phonenumber = user.PhoneNumber,
                Roles = roles
            });
        }

        [Authorize]
        [HttpPatch("update")]
        public async Task<IActionResult> UpdateContact([FromBody] UpdateContactDTO updateContactDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound(new { Message = "User not found" });

            // Update contact fields
            user.Email = updateContactDto.Email;
            user.PhoneNumber = updateContactDto.Phonenumber;

            var result = await _userManager.UpdateAsync(user);
            if (result.Succeeded)
            {
                _logger.LogInformation("[AuthAPIController] user updated contact info for {@username}", user.UserName);
                return Ok(new { Message = "Contact information updated successfully" });
            }

            var errors = result.Errors.Select(e => e.Description).ToArray();
            return BadRequest(new { Errors = errors });
        }

        [Authorize]
        [HttpPatch("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO changePasswordDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound(new { Message = "User not found" });

            var result = await _userManager.ChangePasswordAsync(user, changePasswordDto.OldPassword, changePasswordDto.NewPassword);
            if (result.Succeeded)
            {
                _logger.LogInformation("[AuthAPIController] user changed password for {@username}", user.UserName);
                return Ok(new { Message = "Password changed successfully" });
            }

            var errors = result.Errors.Select(e => e.Description).ToArray();
            return BadRequest(new { Errors = errors });
        }

        [Authorize]
        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteAccount()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound(new { Message = "User not found" });

            var result = await _userManager.DeleteAsync(user);
            if (result.Succeeded)
            {
                _logger.LogInformation("[AuthAPIController] user deleted account for {@username}", user.UserName);
                return Ok(new { Message = "Account deleted successfully" });
            }

            var errors = result.Errors.Select(e => e.Description).ToArray();
            return BadRequest(new { Errors = errors });
        }

        // --- ADMIN / USER CONTROL ENDPOINTS ---

        /**
         * Retrieves a list of all registered users. Access requires a valid JWT token.
         */
        [Authorize]
        [HttpGet("users")]
        public IActionResult GetAllUsers()
        {
            var users = _userManager.Users
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    UserName = u.UserName ?? string.Empty, 
                    Email = u.Email ?? string.Empty,
                    PhoneNumber = u.PhoneNumber ?? string.Empty
                })
                .ToList();

            return Ok(users);
        }

        /**
         * Deletes a specific user by ID. Uses the simplified route.
         */
        [Authorize]
        [HttpDelete("user/{userId}")] // <--- FORENKLET RUTE
        public async Task<IActionResult> DeleteUser(string userId)
        {
            // [Authorize] ensures the current user is logged in
            
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound(new { Message = $"User not found with ID: {userId}" });

            // Prevents deletion of the hardcoded 'admin' user
            if (user.UserName?.ToLower() == "admin")
                return BadRequest(new { Message = "Cannot delete the Admin user." });

            var result = await _userManager.DeleteAsync(user);
            
            if (result.Succeeded)
                return Ok(new { Message = $"User '{user.UserName}' deleted successfully." });

            return BadRequest(new { Errors = result.Errors.Select(e => e.Description) });
        }

        // --- PRIVATE HELPER METHOD ---


        private async Task<string> GenerateJwtToken(AuthUser user)
        {
            var jwtKey = _configuration["Jwt:Key"]; // The secret key used for the signature
            if (string.IsNullOrEmpty(jwtKey)) // Ensure the key is not null or empty
            {
                _logger.LogError("[AuthAPIController] JWT key is missing from configuration.");
                throw new InvalidOperationException("JWT key is missing from configuration.");
            }

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            // Get user roles
            var roles = await _userManager.GetRolesAsync(user);

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

            _logger.LogInformation("[AuthAPIController] JWT token created for {@username} with roles: {roles}", user.UserName, string.Join(", ", roles));
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}