using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    public class Quiz

    {
        [Key]
        public int QuizId { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        [ForeignKey("AuthUser")]
        public string UserId { get; set; } = string.Empty;

        public virtual AuthUser? Creator { get; set; }

         public virtual ICollection<Question> Questions { get; set; } = new List<Question>();
    }
    
    
}