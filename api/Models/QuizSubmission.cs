using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    // Represents a user's quiz submission/result
    public class QuizSubmission
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string? UserId { get; set; } = string.Empty;

        [ForeignKey("UserId")]
        public virtual AuthUser? User { get; set; }

        [Required]
        public int? QuizId { get; set; }

        [ForeignKey("QuizId")]
        public virtual Quiz? Quiz { get; set; }

        // The score the user achieved
        public int Score { get; set; }

        // The maximum possible score for the quiz at the time of submission
        public int MaxScore { get; set; }

        // Questions of the quiz at the time of submission (serialized as JSON)
        public string QuestionsSnapshot { get; set; } = string.Empty;

        // Answers provided by the user (serialized as JSON)
        public string AnswersSnapshot { get; set; } = string.Empty;

        // When the quiz was submitted
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    }
}
