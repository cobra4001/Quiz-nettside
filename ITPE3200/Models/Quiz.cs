using System;
namespace ITPE3200.Models
{
    public class Quiz
    {
        public int QuizId { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}   