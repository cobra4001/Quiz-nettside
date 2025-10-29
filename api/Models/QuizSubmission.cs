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
        public string UserId { get; set; } = string.Empty;

        [ForeignKey("UserId")]
        public virtual AuthUser? User { get; set; }

        [Required]
        public int QuizId { get; set; }

        [ForeignKey("QuizId")]
        public virtual Quiz? Quiz { get; set; }

        // The score the user achieved
        public int Score { get; set; }

        // The maximum possible score for the quiz at the time of submission
        public int MaxScore { get; set; }

        // When the quiz was submitted
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    }
}
