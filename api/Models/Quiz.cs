using System.ComponentModel.DataAnnotations;

namespace api.Models
{
    public class Quiz
    {
        // Primærnøkkel: Følger EF Core-konvensjonen 
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

    
    [Required]
    public string UserId { get; set; } = string.Empty;

        public virtual AuthUser? Creator { get; set; }

        public virtual ICollection<Question> Questions { get; set; } = new List<Question>();
    }
}