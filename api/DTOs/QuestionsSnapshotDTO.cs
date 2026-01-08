using System.Text.Json;

namespace api.DTOs;

// We keep these two DTOs together as they are closely related, used for transferring question snapshots along with their answers.


//DTO for QuestionSnapshot
public class QuestionSnapshotDTO
{
    public int Id { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public int Points { get; set; }
    public List<AnswerSnapshot> Answers { get; set; } = new List<AnswerSnapshot>();
}

//DTO for AnswerSnapshot
public class AnswerSnapshot
{
    public int Id { get; set; }
    public string AnswerText { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
}