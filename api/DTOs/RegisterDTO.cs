using System.ComponentModel.DataAnnotations;

namespace api.DTOs
{
    public class RegisterDTO
    {
        [Required]
        [MinLength(3), MaxLength(20)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [RegularExpression(@"^\d{8}$", ErrorMessage = "Phone number must be exactly 8 digits.")]
        public string Phonenumber { get; set; } = string.Empty;

        [Required]
        [MinLength(8)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [Compare("Password", ErrorMessage = "Passwords do not match.")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}
