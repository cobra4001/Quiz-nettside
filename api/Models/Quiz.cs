using System.ComponentModel.DataAnnotations;

namespace api.Models
{
    // Represents a quiz created by a user
    public class Quiz
    {
        // Primary key
        public int Id { get; set; }

        // Quiz title
        [Required(ErrorMessage = "Title is required")]
        [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
        public string Title { get; set; } = string.Empty;

        // Brief quiz description
        [Required]
        public string Description { get; set; } = string.Empty;

        // ID of the user who created the quiz
        [Required]
        public string UserId { get; set; } = string.Empty;

        // Navigation property to the user who created the quiz
        public virtual AuthUser? Creator { get; set; }

        // Questions in the quiz
        public virtual ICollection<Question> Questions { get; set; } = new List<Question>();
    }
}
