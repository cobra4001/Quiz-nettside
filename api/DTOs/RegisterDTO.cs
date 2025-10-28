using System.ComponentModel.DataAnnotations;

namespace api.DTOs
{
    // Registration request payload for a new user
    public class RegisterDTO
    {
        // Desired username (3-20 characters)
        [Required]
        [MinLength(3), MaxLength(20)]
        public string Username { get; set; } = string.Empty;

        // User's email address
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        // Phone number (exactly 8 digits)
        [Required]
        [RegularExpression(@"^\d{8}$", ErrorMessage = "Phone number must be exactly 8 digits.")]
        public string Phonenumber { get; set; } = string.Empty;

        // Account password (min 8 characters)
        [Required]
        [MinLength(8)]
        public string Password { get; set; } = string.Empty;

        // Must match Password
        [Required]
        [Compare("Password", ErrorMessage = "Passwords do not match.")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}
