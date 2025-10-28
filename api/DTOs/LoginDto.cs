using System.ComponentModel.DataAnnotations;

namespace api.DTOs
{
    // Login request payload
    public class LoginDTO
    {
        // Username of the account
        [Required]
        public string Username { get; set; } = string.Empty;

        // Account password
        [Required]
        public string Password { get; set; } = string.Empty;
    }
}