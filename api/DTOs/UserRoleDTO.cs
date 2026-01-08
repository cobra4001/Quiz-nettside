using System.ComponentModel.DataAnnotations;

namespace api.DTOs
{

    //DTO for User Roles
    public class UserRoleDTO
    {
        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = string.Empty;
    }
}
