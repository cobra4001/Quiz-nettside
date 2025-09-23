using System.ComponentModel.DataAnnotations;

namespace api.DTOs
{
    public class QuizCreationDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MinLength(1, ErrorMessage = "A quiz must have at least one question.")]
        public List<QuestionCreationDto> Questions { get; set; } = new List<QuestionCreationDto>();
    }

    public class QuestionCreationDto
    {
        [Required]
        public string QuestionText { get; set; } = string.Empty;

        public int Points { get; set; } = 10;

        [Required]
        [MinLength(2, ErrorMessage = "A question must have at least two answer options.")]
        public List<AnswerCreationDto> Answers { get; set; } = new List<AnswerCreationDto>();

    }

    public class AnswerCreationDto
    {
        [Required]
        public string AnswerText { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
    }
}

