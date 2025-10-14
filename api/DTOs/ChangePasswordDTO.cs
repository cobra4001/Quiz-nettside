using System.ComponentModel.DataAnnotations;

namespace api.DTOs
{
    public class ChangePasswordDTO
    {
        [Required]
        [MinLength(8)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [Compare("Password", ErrorMessage = "Passwords do not match.")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}