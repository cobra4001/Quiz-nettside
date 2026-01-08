using Microsoft.EntityFrameworkCore;
using api.Models;
using api.DTOs;

namespace api.DAL;

public class QuizRepository : IQuizRepository
{
    private readonly AuthUserDbContext _context;

    public QuizRepository(AuthUserDbContext context)
    {
        _context = context;
    }

    public async Task<Quiz> CreateQuiz(QuizCreationDto quizDto, string userId)
    {
        var quiz = new Quiz
        {
            Title = quizDto.Title,
            Description = quizDto.Description,
            UserId = userId,
            Questions = quizDto.Questions.Select(qDto => new Question
            {
                QuestionText = qDto.QuestionText,
                Points = qDto.Points,
                Answers = qDto.Answers.Select(aDto => new Answer
                {
                    AnswerText = aDto.AnswerText,
                    IsCorrect = aDto.IsCorrect
                }).ToList()
            }).ToList()
        };

        _context.Quizzes.Add(quiz);
        await _context.SaveChangesAsync();

        return quiz;
    }

    public async Task<List<Quiz>> GetQuizzes()
    {
        return await _context.Quizzes
            .Include(q => q.Creator)
            .Include(q => q.Questions)
            .ToListAsync();
    }

    public async Task<List<Quiz>> GetMyQuizzes(string userId)
    {
        return await _context.Quizzes
            .Where(q => q.UserId == userId)
            .Include(q => q.Creator)
            .Include(q => q.Questions)
            .ToListAsync();
    }

    public async Task<Quiz?> GetQuizById(int id)
    {
        return await _context.Quizzes
            .Include(q => q.Questions)
            .ThenInclude(q => q.Answers)
            .FirstOrDefaultAsync(q => q.Id == id);
    }

    public async Task<Quiz?> GetQuizForEdit(int id, string userId)
    {
        var quiz = await _context.Quizzes
            .Include(q => q.Questions)
            .ThenInclude(q => q.Answers)
            .FirstOrDefaultAsync(q => q.Id == id);

        // Return null if quiz doesn't exist or user doesn't own it
        if (quiz == null || quiz.UserId != userId)
            return null;

        return quiz;
    }

    public async Task<Quiz?> UpdateQuiz(int id, QuizCreationDto quizDto, string userId)
    {
        var existingQuiz = await _context.Quizzes
            .Include(q => q.Questions)
            .ThenInclude(q => q.Answers)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (existingQuiz == null || existingQuiz.UserId != userId)
            return null;

        // Update quiz properties
        existingQuiz.Title = quizDto.Title;
        existingQuiz.Description = quizDto.Description;

        // Remove all existing questions and answers
        _context.Questions.RemoveRange(existingQuiz.Questions);

        // Add new questions and answers
        existingQuiz.Questions = quizDto.Questions.Select(qDto => new Question
        {
            QuestionText = qDto.QuestionText,
            Points = qDto.Points,
            Answers = qDto.Answers.Select(aDto => new Answer
            {
                AnswerText = aDto.AnswerText,
                IsCorrect = aDto.IsCorrect
            }).ToList()
        }).ToList();

        await _context.SaveChangesAsync();
        return existingQuiz;
    }

    public async Task<bool> DeleteQuiz(int id)
    {
        var quiz = await _context.Quizzes
            .Include(q => q.Questions)
            .ThenInclude(q => q.Answers)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (quiz == null)
            return false;

        _context.Quizzes.Remove(quiz);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<Quiz?> GetQuizForSubmission(int id)
    {
        return await _context.Quizzes
            .Include(q => q.Questions)
            .ThenInclude(q => q.Answers)
            .FirstOrDefaultAsync(q => q.Id == id);
    }
    public async Task<QuizSubmission> SaveQuizSubmission(QuizSubmission submission)
    {
        _context.QuizSubmissions.Add(submission);
        await _context.SaveChangesAsync();
        return submission;
    }

    public async Task<List<QuizSubmission>> GetMySubmissions(string userId)
    {
        return await _context.QuizSubmissions
            .Where(s => s.UserId == userId)
            .Include(s => s.Quiz)
            .OrderByDescending(s => s.SubmittedAt)
            .ToListAsync();
    }
}