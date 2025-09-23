using System.ComponentModel.DataAnnotations;

namespace api.DTOs
{
    public class QuizSubmissionDto
    {
        [Required]
        public int QuizId { get; set; }

        [Required]
         public Dictionary<int, int> SelectedAnswers { get; set; } = new Dictionary<int, int>();
    }

}
