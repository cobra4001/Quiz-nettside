using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using api.DTOs;
using api.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase // ControllerBase is sufficient for API controllers
    {
        private readonly UserManager<AuthUser> _userManager;
        private readonly SignInManager<AuthUser> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;
        private readonly AuthUserDbContext _context;

        public AuthController(UserManager<AuthUser> userManager,
        SignInManager<AuthUser> signInManager,
        IConfiguration configuration,
        ILogger<AuthController> logger,
        AuthUserDbContext context)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _logger = logger;
            _context = context;
        }
        

       [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO registerDto)
        {
        if (!ModelState.IsValid)
            return BadRequest(ModelState); // Automatic validation with [Compare], [Required], [RegularExpression], etc.

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

        // Convert error list to array of descriptions
        var errors = result.Errors.Select(e => e.Description).ToArray();
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
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
            {
                _logger.LogWarning("UserId is null, returning Unauthorized");
                return Unauthorized();
            }

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

            user.Email = updateContactDto.Email;
            user.PhoneNumber = updateContactDto.Phonenumber;

            var result = await _userManager.UpdateAsync(user);
            if (result.Succeeded)
            {
                _logger.LogInformation("[AuthAPIController] user updated contact info for {@username}", user.UserName);
                return Ok(new { Message = "Contact information updated successfully" });
            }

            var errors = result.Errors.Select(e => e.Description).ToArray();
            Console.WriteLine(errors);
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
            Console.WriteLine(errors);
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

        [Authorize] // not strictly necessary for logout, but good practice
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            // For token-based authentication, logout is typically handled on the client-side by clearing the token. This endpoint can be used for things like token invalidation if implemented.
            await _signInManager.SignOutAsync(); // This is more for cookie-based auth, but doesn't hurt.
            _logger.LogInformation("[AuthAPIController] user logged out");
            return Ok(new { Message = "Logout successful" });
        }

        private async Task<string> GenerateJwtToken(AuthUser user)
        {
            var jwtKey = _configuration["Jwt:Key"]; // The secret key used for the signature
            if (string.IsNullOrEmpty(jwtKey)) // Ensure the key is not null or empty
            {
                _logger.LogError("[AuthAPIController] JWT key is missing from configuration.");
                throw new InvalidOperationException("JWT key is missing from configuration.");
            }
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)); // Reading the key from the configuration
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256); // Using HMAC SHA256 algorithm for signing the token

            // Get user roles
            var roles = await _userManager.GetRolesAsync(user);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.UniqueName, user.UserName!),
                new Claim(JwtRegisteredClaimNames.NameId, user.Id),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), // Unique identifier for the token
                new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString()) // Issued at timestamp
            };

            // Add role claims
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(120), // Token expiration time set to 120 minutes
                signingCredentials: credentials); // Signing the token with the specified credentials

            _logger.LogInformation("[AuthAPIController] JWT token created for {@username} with roles: {roles}", user.UserName, string.Join(", ", roles));
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}