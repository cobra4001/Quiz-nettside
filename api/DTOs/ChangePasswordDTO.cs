using System.ComponentModel.DataAnnotations;

namespace api.DTOs
{
    // DTO for changing a user's password
    public class ChangePasswordDTO
    {
        // Current password used to verify identity
        [Required]
        public string OldPassword { get; set; } = string.Empty;

        // New password (min 8 characters)
        [Required]
        [MinLength(8)]
        public string NewPassword { get; set; } = string.Empty;

        // Must match NewPassword
        [Required]
        [Compare("NewPassword", ErrorMessage = "Passwords do not match.")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}