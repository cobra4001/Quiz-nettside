using System.Text.Json;

// DTO for Question Snapshot
public class QuestionSnapshotDTO
{
    public int Id { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public int Points { get; set; }
    public List<AnswerSnapshot> Answers { get; set; } = new List<AnswerSnapshot>();
}

// Snapshot of an Answer
public class AnswerSnapshot
{
    public int Id { get; set; }
    public string AnswerText { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
}