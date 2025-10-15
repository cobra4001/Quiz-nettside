using System.ComponentModel.DataAnnotations;

namespace api.DTOs
{
    public class UpdateContactDTO
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [RegularExpression(@"^\d{8}$", ErrorMessage = "Phone number must be exactly 8 digits.")]
        public string Phonenumber { get; set; } = string.Empty;
    }
}