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
            var user = new AuthUser
            {
                UserName = registerDto.Username
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);
            
            if (result.Succeeded)
            {
                _logger.LogInformation("[AuthAPIController] user registered for {@username}", registerDto.Username);
                return Ok(new { Message = "User registered successfully" });
            }

            _logger.LogWarning("[AuthAPIController] user registration failed for {@username}", registerDto.Username);
            return BadRequest(result.Errors);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO loginDto)
        {
            var user = await _userManager.FindByNameAsync(loginDto.Username);

            if (user != null && await _userManager.CheckPasswordAsync(user, loginDto.Password))
            {
                _logger.LogInformation("[AuthAPIController] user authorised for {@username}", loginDto.Username);
                var token = GenerateJwtToken(user);
                return Ok(new { Token = token });
            }
            
            _logger.LogWarning("[AuthAPIController] user not authorised for {@username}", loginDto.Username);
            return Unauthorized();
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

        private string GenerateJwtToken(AuthUser user)
        {
            var jwtKey = _configuration["Jwt:Key"]; // The secret key used for the signature
            if (string.IsNullOrEmpty(jwtKey)) // Ensure the key is not null or empty
            {   
                _logger.LogError("[AuthAPIController] JWT key is missing from configuration.");
                throw new InvalidOperationException("JWT key is missing from configuration.");
            }
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)); // Reading the key from the configuration
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256); // Using HMAC SHA256 algorithm for signing the token

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserName!), // Subject of the token
                //new Claim(JwtRegisteredClaimNames.Email, user.Email!), // User's email
                new Claim(ClaimTypes.NameIdentifier, user.Id), // Unique identifier for the user
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), // Unique identifier for the token
                new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString()) // Issued at timestamp
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(120), // Token expiration time set to 120 minutes
                signingCredentials: credentials); // Signing the token with the specified credentials

            _logger.LogInformation("[AuthAPIController] JWT token created for {@username}", user.UserName);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}