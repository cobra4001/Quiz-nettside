using System.ComponentModel.DataAnnotations;

namespace api.DTOs
{
    // Submission payload for a completed quiz
    public class QuizSubmissionDto
    {
        // ID of the quiz being submitted
        [Required]
        public int QuizId { get; set; }

        // Map of questionId -> selected answerId
        [Required]
        public Dictionary<int, int> SelectedAnswers { get; set; } = new Dictionary<int, int>();
    }

}
