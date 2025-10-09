using System.ComponentModel.DataAnnotations;

namespace api.Models
{
    public class Quiz
    {
        // Primærnøkkel
        public int Id { get; set; }

        [Required(ErrorMessage = "Title is required")]
        [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public string UserId { get; set; } = string.Empty;

        // Navigasjonsfelt til brukeren som opprettet quizen
        public virtual AuthUser? Creator { get; set; }

        // Spørsmålene i quizen
        public virtual ICollection<Question> Questions { get; set; } = new List<Question>();
    }
}
