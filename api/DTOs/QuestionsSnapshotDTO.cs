using System.Text.Json;

public class QuestionSnapshotDTO
{
    public int Id { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public int Points { get; set; }
    public List<AnswerSnapshot> Answers { get; set; } = new List<AnswerSnapshot>();
}

public class AnswerSnapshot
{
    public int Id { get; set; }
    public string AnswerText { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
}