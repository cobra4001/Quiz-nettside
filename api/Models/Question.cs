using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    public class Question
    {
    
        public int Id { get; set; }

        [Required]
        public string QuestionText { get; set; } = string.Empty;

        public int Points { get; set; }

        public int QuizId { get; set; }

        public virtual Quiz? Quiz { get; set; }

        public virtual ICollection<Answer> Answers { get; set; } = new List<Answer>();
    }
}