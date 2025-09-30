using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    public class Answer
    {
   
        public int Id { get; set; }

        [Required]
        public string AnswerText { get; set; } = string.Empty;

        public bool IsCorrect { get; set; }

       
        public int QuestionId { get; set; }
        
        public virtual Question? Question { get; set; }
    }
}