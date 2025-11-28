using System.ComponentModel.DataAnnotations;
//DTO for user roles
namespace api.DTOs
{
    public class UserRoleDTO
    {
        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = string.Empty;
    }
}
