using System.ComponentModel.DataAnnotations;

namespace api.DTOs
{
    // Payload to update user's contact details
    public class UpdateContactDTO
    {
        // New email address
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        // New phone number (exactly 8 digits)
        [Required]
        [RegularExpression(@"^\d{8}$", ErrorMessage = "Phone number must be exactly 8 digits.")]
        public string Phonenumber { get; set; } = string.Empty;
    }
}