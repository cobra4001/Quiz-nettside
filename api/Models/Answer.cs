using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    // Represents an answer option for a question
    public class Answer
    {
        // Primary key
        public int Id { get; set; }

        // The answer text
        [Required]
        public string AnswerText { get; set; } = string.Empty;

        // True if this answer is correct
        public bool IsCorrect { get; set; }

        // Foreign key to the question
        public int QuestionId { get; set; }
        // Navigation to the related question
        public virtual Question? Question { get; set; }
    }
}