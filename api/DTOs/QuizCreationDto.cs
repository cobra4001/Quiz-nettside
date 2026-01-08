using System.ComponentModel.DataAnnotations;

namespace api.DTOs
{
    // DTO for creating a quiz
    public class QuizCreationDto
    {
        // Quiz title
        [Required]
        public string Title { get; set; } = string.Empty;

        // Brief quiz description
        [Required(ErrorMessage = "Description is required")]
        public string Description { get; set; } = string.Empty; 


        // Questions included in the quiz
        [Required]
        [MinLength(1, ErrorMessage = "A quiz must have at least one question.")]
        public List<QuestionCreationDto> Questions { get; set; } = new List<QuestionCreationDto>();
    }

    // DTO for creating a question
    public class QuestionCreationDto
    {
        // The question text
        [Required]
        public string QuestionText { get; set; } = string.Empty;

        // Points awarded for a correct answer
        public int Points { get; set; } = 10;

        // Answer options for the question
        [Required]
        [MinLength(2, ErrorMessage = "A question must have at least two answer options.")]
        public List<AnswerCreationDto> Answers { get; set; } = new List<AnswerCreationDto>();

    }

    // DTO for creating an answer option
    public class AnswerCreationDto
    {
        // The answer text
        [Required]
        public string AnswerText { get; set; } = string.Empty;
        // Whether this answer is correct
        public bool IsCorrect { get; set; }
    }
}

