using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    // Represents a quiz question
    public class Question
    {
        // Primary key
        public int Id { get; set; }

        // The question text
        [Required]
        public string QuestionText { get; set; } = string.Empty;

        // Points awarded for a correct answer
        public int Points { get; set; }

        // Foreign key to the quiz
        public int QuizId { get; set; }

        // Navigation to the parent quiz
        public virtual Quiz? Quiz { get; set; }

        // Answer options for this question
        public virtual ICollection<Answer> Answers { get; set; } = new List<Answer>();
    }
}